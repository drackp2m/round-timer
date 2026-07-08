import { Injectable, inject } from '@angular/core';

import {
	SerializedBase,
	SerializedUpdatable,
} from '@app/definition/use-case/backup-file.interface';
import { NormalizedBackupFile, RestoreCounters } from '@app/definition/use-case/restore.interface';
import { MatchEvent } from '@app/model/match-event.model';
import { MatchPlayer } from '@app/model/match-player.model';
import { Match } from '@app/model/match.model';
import { MatchRepository } from '@app/repository/match.repository';
import { BackupSerializer } from '@app/util/backup-serializer';

export interface RestoreDependentSummary {
	matches: RestoreCounters;
	matchPlayers: RestoreCounters;
	matchEvents: RestoreCounters;
}

/**
 * Inserts the records that depend on deduplicated entities (matches on games,
 * match players on players) with their foreign keys remapped to the canonical
 * uuids that `RestoreDataUseCase` resolved. Split out to keep that use-case
 * focused on conflict analysis and resolution.
 */
@Injectable({ providedIn: 'root' })
export class RestoreDependentDataUseCase {
	private readonly matchRepository = inject(MatchRepository);

	async execute(
		backup: NormalizedBackupFile,
		gameUuidMap: Map<string, string>,
		playerUuidMap: Map<string, string>,
	): Promise<RestoreDependentSummary> {
		const matches = await this.restoreMatches(backup.matches, gameUuidMap);
		const matchPlayers = await this.restoreMatchPlayers(backup.matchPlayers, playerUuidMap);
		const matchEvents = await this.restoreMatchEvents(backup.matchEvents);

		return { matches, matchPlayers, matchEvents };
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

		return { added: matches.length, updated: 0, skipped: 0 };
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

		return { added: matchPlayers.length, updated: 0, skipped: 0 };
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

		return { added: matchEvents.length, updated: 0, skipped: 0 };
	}
}
