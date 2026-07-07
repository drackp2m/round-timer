import { Injectable, inject } from '@angular/core';

import { BackupFile } from '@app/definition/use-case/backup-file.interface';
import { GameRepository } from '@app/repository/game.repository';
import { MatchRepository } from '@app/repository/match.repository';
import { PlayerRepository } from '@app/repository/player.repository';
import { SettingRepository } from '@app/repository/setting.repository';
import { BackupSerializer } from '@app/util/backup-serializer';
import { JsonFile } from '@app/util/json-file';
import { Repository } from '@app/util/repository';

@Injectable()
export class BackupDataUseCase {
	private readonly playerRepository = inject(PlayerRepository);
	private readonly gameRepository = inject(GameRepository);
	private readonly settingRepository = inject(SettingRepository);
	private readonly matchRepository = inject(MatchRepository);

	async execute(): Promise<void> {
		const backup: BackupFile = {
			version: Repository.getLatestVersion(),
			exportedAt: new Date().toISOString(),
			players: (await this.playerRepository.findAll('player')).map((item) =>
				BackupSerializer.serializeUpdatable(item),
			),
			games: (await this.gameRepository.findAll('game')).map((item) =>
				BackupSerializer.serializeUpdatable(item),
			),
			settings: (await this.settingRepository.findAll('setting')).map((item) =>
				BackupSerializer.serializeUpdatable(item),
			),
			matches: (await this.matchRepository.findAll('match')).map((item) =>
				BackupSerializer.serializeUpdatable(item),
			),
			matchPlayers: (await this.matchRepository.findAll('match_player')).map((item) =>
				BackupSerializer.serializeUpdatable(item),
			),
			matchEvents: (await this.matchRepository.findAll('match_event')).map((item) =>
				BackupSerializer.serializeBase(item),
			),
		};

		JsonFile.download(this.buildFileName(), backup);
	}

	private buildFileName(): string {
		return `round-timer-backup-${new Date().toISOString().slice(0, 10)}.json`;
	}
}
