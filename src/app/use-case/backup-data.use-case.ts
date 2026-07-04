import { Injectable, inject } from '@angular/core';

import { BackupFile, SerializedRecord } from '@app/definition/use-case/backup-file.interface';
import { GameStore } from '@app/store/game.store';
import { PlayerStore } from '@app/store/player.store';
import { JsonFile } from '@app/util/json-file';

@Injectable()
export class BackupDataUseCase {
	private readonly playerStore = inject(PlayerStore);
	private readonly gameStore = inject(GameStore);

	execute(): void {
		const backup: BackupFile = {
			version: 1,
			exportedAt: new Date().toISOString(),
			players: this.playerStore.playerEntities().map((player) => this.serialize(player)),
			games: (this.gameStore.items() ?? []).map((game) => this.serialize(game)),
		};

		JsonFile.download(this.buildFileName(), backup);
	}

	private serialize<T extends { createdAt: Date; updatedAt: Date }>(model: T): SerializedRecord<T> {
		return {
			...model,
			createdAt: model.createdAt.toISOString(),
			updatedAt: model.updatedAt.toISOString(),
		};
	}

	private buildFileName(): string {
		return `round-timer-backup-${new Date().toISOString().slice(0, 10)}.json`;
	}
}
