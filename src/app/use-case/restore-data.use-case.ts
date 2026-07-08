import { Injectable, inject } from '@angular/core';

import { BackupFile, SerializedUpdatable } from '@app/definition/use-case/backup-file.interface';
import {
	EntityAnalysis,
	NormalizedBackupFile,
	RestoreConflict,
	RestoreCounters,
	RestoreResolutions,
	RestoreSession,
	RestoreSummary,
} from '@app/definition/use-case/restore.interface';
import { Game } from '@app/model/game.model';
import { Player } from '@app/model/player.model';
import { Setting } from '@app/model/setting.model';
import { GameStore } from '@app/store/game.store';
import { PlayerStore } from '@app/store/player.store';
import { RestoreConflictStore } from '@app/store/restore-conflict.store';
import { SettingStore } from '@app/store/setting.store';
import { RestoreDependentDataUseCase } from '@app/use-case/restore-dependent-data.use-case';
import { BackupSerializer } from '@app/util/backup-serializer';
import { JsonFile } from '@app/util/json-file';
import { Repository } from '@app/util/repository';

export type { RestoreCounters, RestoreSummary } from '@app/definition/use-case/restore.interface';

@Injectable()
export class RestoreDataUseCase {
	private readonly playerStore = inject(PlayerStore);
	private readonly gameStore = inject(GameStore);
	private readonly settingStore = inject(SettingStore);
	private readonly restoreConflictStore = inject(RestoreConflictStore);
	private readonly restoreDependentData = inject(RestoreDependentDataUseCase);

	/**
	 * Reads the backup, classifies every deduplicated entity (player, game,
	 * setting) as brand new, identical or conflicting, and stores the resulting
	 * session so the conflict page can pick it up. Nothing is written to the
	 * database yet — that happens on `apply` once the user has chosen.
	 */
	async analyze(file: File): Promise<RestoreSession> {
		const backup = await this.readBackupFile(file);

		const players = this.analyzeByUniqueKey<Player>(
			backup.players,
			this.playerStore.playerEntities(),
			(item) => item.nick,
			(raw) => new Player(BackupSerializer.deserializeUpdatable<Player>(raw)),
			(existing, incoming) =>
				existing.name === incoming.name &&
				existing.color === incoming.color &&
				existing.icon === incoming.icon,
		);
		const games = this.analyzeByUniqueKey<Game>(
			backup.games,
			this.gameStore.items() ?? [],
			(item) => item.name,
			(raw) => new Game(BackupSerializer.deserializeUpdatable<Game>(raw)),
			(existing, incoming) =>
				existing.maxPlayers === incoming.maxPlayers &&
				existing.turnType === incoming.turnType &&
				existing.turnOrder === incoming.turnOrder &&
				existing.victoryType === incoming.victoryType,
		);
		// Settings never surface a conflict to the user: an existing type is kept.
		const settings = this.analyzeByUniqueKey<Setting>(
			backup.settings,
			this.settingStore.settingEntities(),
			(item) => item.type,
			(raw) => new Setting(BackupSerializer.deserializeUpdatable<Setting>(raw)),
			() => true,
		);

		const session: RestoreSession = { players, games, settings, backup };

		this.restoreConflictStore.setSession(session);

		return session;
	}

	hasConflicts(session: RestoreSession): boolean {
		return 0 !== session.players.conflicts.length || 0 !== session.games.conflicts.length;
	}

	/**
	 * Persists the analyzed session: inserts new records, overwrites the
	 * existing record for every conflict the user resolved as `incoming`, and
	 * finally inserts the dependent records with their references remapped to
	 * the canonical uuids. Consumes and clears the pending session.
	 */
	async apply(resolutions: RestoreResolutions): Promise<RestoreSummary> {
		const session = this.restoreConflictStore.session();

		if (null === session) {
			return Promise.reject(new Error('No restore session to apply'));
		}

		const players = this.applyEntity<Player>(
			session.players,
			resolutions,
			(raw) => {
				this.playerStore.add(new Player(BackupSerializer.deserializeUpdatable<Player>(raw)));
			},
			(conflict) => {
				this.playerStore.update(new Player(this.mergeIntoExisting<Player>(conflict)));
			},
		);
		const games = this.applyEntity<Game>(
			session.games,
			resolutions,
			(raw) => {
				this.gameStore.addGame(new Game(BackupSerializer.deserializeUpdatable<Game>(raw)));
			},
			(conflict) => {
				this.gameStore.updateGame(new Game(this.mergeIntoExisting<Game>(conflict)));
			},
		);
		const settings = this.applyEntity<Setting>(
			session.settings,
			resolutions,
			(raw) => {
				this.settingStore.add(new Setting(BackupSerializer.deserializeUpdatable<Setting>(raw)));
			},
			() => undefined,
		);

		const { matches, matchPlayers, matchEvents } = await this.restoreDependentData.execute(
			session.backup,
			session.games.uuidMap,
			session.players.uuidMap,
		);

		const summary: RestoreSummary = {
			players,
			games,
			settings,
			matches,
			matchPlayers,
			matchEvents,
		};

		this.restoreConflictStore.setSummary(summary);
		this.restoreConflictStore.setSession(null);

		return summary;
	}

	private async readBackupFile(file: File): Promise<NormalizedBackupFile> {
		const data = await JsonFile.read(file);

		if (!this.isBackupFile(data)) {
			return Promise.reject(new Error('Invalid backup file'));
		}

		if (data.version > Repository.getLatestVersion()) {
			return Promise.reject(
				new Error('This backup was created with a newer version of the app. Please update first.'),
			);
		}

		return {
			players: data.players ?? [],
			games: data.games ?? [],
			settings: data.settings ?? [],
			matches: data.matches ?? [],
			matchPlayers: data.matchPlayers ?? [],
			matchEvents: data.matchEvents ?? [],
		};
	}

	private isBackupFile(data: unknown): data is BackupFile {
		const candidate = data as Partial<BackupFile> | null;

		return (
			null !== candidate && 'object' === typeof candidate && 'number' === typeof candidate.version
		);
	}

	/**
	 * Classifies entities deduplicated by a unique business key (player.nick,
	 * game.name, setting.type). Records without a local match are new; matching
	 * records with identical data are skipped; matching records with different
	 * data become conflicts. The returned uuidMap always points each incoming
	 * uuid at the canonical (existing, when present) uuid, regardless of how the
	 * conflict is later resolved, so dependent records can be remapped up front.
	 */
	private analyzeByUniqueKey<T extends { uuid: string }>(
		rawItems: (SerializedUpdatable<T> & { uuid: string })[],
		existingItems: T[],
		keyOf: (item: T | SerializedUpdatable<T>) => string,
		deserialize: (raw: SerializedUpdatable<T>) => T,
		isEqual: (existing: T, incoming: T) => boolean,
	): EntityAnalysis<T> {
		const existingByKey = new Map(existingItems.map((item) => [keyOf(item), item]));
		const uuidMap = new Map<string, string>();
		const newItems: SerializedUpdatable<T>[] = [];
		const conflicts: RestoreConflict<T>[] = [];

		let identicalCount = 0;

		for (const raw of rawItems) {
			const key = keyOf(raw);
			const existing = existingByKey.get(key);

			if (undefined === existing) {
				const model = deserialize(raw);
				existingByKey.set(key, model);
				uuidMap.set(raw.uuid, raw.uuid);
				newItems.push(raw);

				continue;
			}

			uuidMap.set(raw.uuid, existing.uuid);

			if (isEqual(existing, deserialize(raw))) {
				identicalCount++;
			} else {
				conflicts.push({ key, existing, incoming: deserialize(raw), incomingRaw: raw });
			}
		}

		return { newItems, conflicts, identicalCount, uuidMap };
	}

	private applyEntity<T extends { uuid: string }>(
		analysis: EntityAnalysis<T>,
		resolutions: RestoreResolutions,
		insert: (raw: SerializedUpdatable<T>) => void,
		overwrite: (conflict: RestoreConflict<T>) => void,
	): RestoreCounters {
		let added = 0;
		let updated = 0;
		let skipped = analysis.identicalCount;

		for (const raw of analysis.newItems) {
			insert(raw);
			added++;
		}

		for (const conflict of analysis.conflicts) {
			if ('incoming' === resolutions[conflict.existing.uuid]) {
				overwrite(conflict);
				updated++;
			} else {
				skipped++;
			}
		}

		return { added, updated, skipped };
	}

	/**
	 * Builds the incoming record but forces it onto the existing uuid (and keeps
	 * the original creation date), so overwriting a conflict never orphans the
	 * references that already point at the local record.
	 */
	private mergeIntoExisting<T extends { uuid: string; createdAt: Date }>(
		conflict: RestoreConflict<T>,
	): T {
		const merged: SerializedUpdatable<T> = {
			...conflict.incomingRaw,
			uuid: conflict.existing.uuid,
			createdAt: conflict.existing.createdAt.toISOString(),
		};

		return BackupSerializer.deserializeUpdatable<T>(merged);
	}
}
