import { Injectable, inject } from '@angular/core';

import {
	BackupFile,
	SerializedBase,
	SerializedUpdatable,
} from '@app/definition/use-case/backup-file.interface';
import { Game } from '@app/model/game.model';
import { MatchEvent } from '@app/model/match-event.model';
import { MatchPlayer } from '@app/model/match-player.model';
import { Match } from '@app/model/match.model';
import { Player } from '@app/model/player.model';
import { Setting } from '@app/model/setting.model';
import { MatchRepository } from '@app/repository/match.repository';
import { GameStore } from '@app/store/game.store';
import { PlayerStore } from '@app/store/player.store';
import { SettingStore } from '@app/store/setting.store';
import { BackupSerializer } from '@app/util/backup-serializer';
import { JsonFile } from '@app/util/json-file';
import { Repository } from '@app/util/repository';

export interface RestoreCounters {
	added: number;
	skipped: number;
}

export interface RestoreSummary {
	players: RestoreCounters;
	games: RestoreCounters;
	settings: RestoreCounters;
	matches: RestoreCounters;
	matchPlayers: RestoreCounters;
	matchEvents: RestoreCounters;
}

interface RestoreByKeyResult {
	counters: RestoreCounters;
	uuidMap: Map<string, string>;
}

interface NormalizedBackupFile {
	players: SerializedUpdatable<Player>[];
	games: SerializedUpdatable<Game>[];
	settings: SerializedUpdatable<Setting>[];
	matches: SerializedUpdatable<Match>[];
	matchPlayers: SerializedUpdatable<MatchPlayer>[];
	matchEvents: SerializedBase<MatchEvent>[];
}

@Injectable()
export class RestoreDataUseCase {
	private readonly playerStore = inject(PlayerStore);
	private readonly gameStore = inject(GameStore);
	private readonly settingStore = inject(SettingStore);
	private readonly matchRepository = inject(MatchRepository);

	async execute(file: File): Promise<RestoreSummary> {
		const backup = await this.readBackupFile(file);

		const players = this.restoreByUniqueKey<Player>(
			backup.players,
			this.playerStore.playerEntities(),
			(item) => item.nick,
			(raw) => {
				this.playerStore.add(new Player(BackupSerializer.deserializeUpdatable<Player>(raw)));
			},
		);
		const games = this.restoreByUniqueKey<Game>(
			backup.games,
			this.gameStore.items() ?? [],
			(item) => item.name,
			(raw) => {
				this.gameStore.addGame(new Game(BackupSerializer.deserializeUpdatable<Game>(raw)));
			},
		);
		const settings = this.restoreByUniqueKey<Setting>(
			backup.settings,
			this.settingStore.settingEntities(),
			(item) => item.type,
			(raw) => {
				this.settingStore.add(new Setting(BackupSerializer.deserializeUpdatable<Setting>(raw)));
			},
		);

		const matches = await this.restoreMatches(backup.matches, games.uuidMap);
		const matchPlayers = await this.restoreMatchPlayers(backup.matchPlayers, players.uuidMap);
		const matchEvents = await this.restoreMatchEvents(backup.matchEvents);

		return {
			players: players.counters,
			games: games.counters,
			settings: settings.counters,
			matches,
			matchPlayers,
			matchEvents,
		};
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
	 * Restores entities that are deduplicated by a unique business key
	 * (player.nick, game.name, setting.type). Matching existing records are
	 * kept as-is and skipped; new ones are inserted. Returns a map from the
	 * backup's original uuid to whichever uuid actually ended up in the
	 * database (the existing one on a skip, the same one on a fresh insert),
	 * so dependent records (matches, ...) can rewrite their references.
	 */
	private restoreByUniqueKey<T extends { uuid: string }>(
		rawItems: (SerializedUpdatable<T> & { uuid: string })[],
		existingItems: T[],
		keyOf: (item: T | SerializedUpdatable<T>) => string,
		insert: (raw: SerializedUpdatable<T>) => void,
	): RestoreByKeyResult {
		const existingUuidByKey = new Map(existingItems.map((item) => [keyOf(item), item.uuid]));
		const uuidMap = new Map<string, string>();

		let added = 0;
		let skipped = 0;

		for (const raw of rawItems) {
			const existingUuid = existingUuidByKey.get(keyOf(raw));

			if (undefined !== existingUuid) {
				uuidMap.set(raw.uuid, existingUuid);
				skipped++;

				continue;
			}

			existingUuidByKey.set(keyOf(raw), raw.uuid);
			uuidMap.set(raw.uuid, raw.uuid);
			insert(raw);
			added++;
		}

		return { counters: { added, skipped }, uuidMap };
	}

	private async restoreMatches(
		rawMatches: SerializedUpdatable<Match>[],
		gameUuidMap: Map<string, string>,
	): Promise<RestoreCounters> {
		const matches = rawMatches.map((raw) => {
			const remapped: SerializedUpdatable<Match> = {
				...raw,
				gameUuid: gameUuidMap.get(raw.gameUuid) ?? raw.gameUuid,
			};

			return BackupSerializer.deserializeUpdatable<Match>(remapped);
		});

		if (0 !== matches.length) {
			await this.matchRepository.batchInsert('match', matches);
		}

		return { added: matches.length, skipped: 0 };
	}

	private async restoreMatchPlayers(
		rawMatchPlayers: SerializedUpdatable<MatchPlayer>[],
		playerUuidMap: Map<string, string>,
	): Promise<RestoreCounters> {
		const matchPlayers = rawMatchPlayers.map((raw) => {
			const remapped: SerializedUpdatable<MatchPlayer> = {
				...raw,
				playerUuid: playerUuidMap.get(raw.playerUuid) ?? raw.playerUuid,
			};

			return BackupSerializer.deserializeUpdatable<MatchPlayer>(remapped);
		});

		if (0 !== matchPlayers.length) {
			await this.matchRepository.batchInsert('match_player', matchPlayers);
		}

		return { added: matchPlayers.length, skipped: 0 };
	}

	private async restoreMatchEvents(
		rawMatchEvents: SerializedBase<MatchEvent>[],
	): Promise<RestoreCounters> {
		const matchEvents = rawMatchEvents.map((raw) =>
			BackupSerializer.deserializeBase<MatchEvent>(raw),
		);

		if (0 !== matchEvents.length) {
			await this.matchRepository.batchInsert('match_event', matchEvents);
		}

		return { added: matchEvents.length, skipped: 0 };
	}
}
