import { Injectable, inject } from '@angular/core';

import { BackupFile, SerializedRecord } from '@app/definition/use-case/backup-file.interface';
import { Game } from '@app/model/game.model';
import { Player } from '@app/model/player.model';
import { GameStore } from '@app/store/game.store';
import { PlayerStore } from '@app/store/player.store';
import { JsonFile } from '@app/util/json-file';

export interface RestoreCounters {
	added: number;
	skipped: number;
}

export interface RestoreSummary {
	players: RestoreCounters;
	games: RestoreCounters;
}

@Injectable()
export class RestoreDataUseCase {
	private readonly playerStore = inject(PlayerStore);
	private readonly gameStore = inject(GameStore);

	async execute(file: File): Promise<RestoreSummary> {
		const backup = await this.readBackupFile(file);

		return {
			players: this.restorePlayers(backup.players),
			games: this.restoreGames(backup.games),
		};
	}

	private async readBackupFile(file: File): Promise<BackupFile> {
		const data = await JsonFile.read(file);

		if (!this.isBackupFile(data)) {
			return Promise.reject(new Error('Invalid backup file'));
		}

		return data;
	}

	private isBackupFile(data: unknown): data is BackupFile {
		const candidate = data as Partial<BackupFile> | null;

		return (
			null !== candidate &&
			'object' === typeof candidate &&
			Array.isArray(candidate.players) &&
			Array.isArray(candidate.games)
		);
	}

	private restorePlayers(players: SerializedRecord<Player>[]): RestoreCounters {
		const existingNicks = new Set(this.playerStore.playerEntities().map((player) => player.nick));

		let added = 0;
		let skipped = 0;

		for (const raw of players) {
			if (existingNicks.has(raw.nick)) {
				skipped++;

				continue;
			}

			existingNicks.add(raw.nick);
			this.playerStore.add(new Player(this.deserialize<Player>(raw)));
			added++;
		}

		return { added, skipped };
	}

	private restoreGames(games: SerializedRecord<Game>[]): RestoreCounters {
		const existingNames = new Set((this.gameStore.items() ?? []).map((game) => game.name));

		let added = 0;
		let skipped = 0;

		for (const raw of games) {
			if (existingNames.has(raw.name)) {
				skipped++;

				continue;
			}

			existingNames.add(raw.name);
			this.gameStore.addGame(new Game(this.deserialize<Game>(raw)));
			added++;
		}

		return { added, skipped };
	}

	private deserialize<T>(raw: SerializedRecord<T>): T {
		return {
			...raw,
			createdAt: new Date(raw.createdAt),
			updatedAt: new Date(raw.updatedAt),
		} as T;
	}
}
