import { Component, inject } from '@angular/core';

import { PlayerColor, PlayerColorKey } from '@app/definition/model/player/player-color.enum';
import { PlayerIcon, PlayerIconKey } from '@app/definition/model/player/player-icon.enum';
import { ButtonDirective } from '@app/directive/button.directive';
import { RouterLinkDirective } from '@app/directive/router-link.directive';
import { Game } from '@app/model/game.model';
import { Player } from '@app/model/player.model';
import { GameRepository } from '@app/repository/game.repository';
import { PlayerRepository } from '@app/repository/player.repository';
import { Generate } from '@app/util/generate';

@Component({
	templateUrl: './dashboard.page.html',
	imports: [RouterLinkDirective, ButtonDirective],
})
export class DashboardPage {
	private readonly gameRepository = inject(GameRepository);
	private readonly playerRepository = inject(PlayerRepository);

	async createInitialData(): Promise<void> {
		const game = new Game({
			name: 'Dune',
			maxPlayers: 6,
			turnType: 'EQUITABLE',
			turnOrder: 'ALWAYS_FIXED',
			victoryType: 'COMPETITIVE',
		});

		const colors = Object.keys(PlayerColor) as PlayerColorKey[];
		const icons = Object.keys(PlayerIcon) as PlayerIconKey[];

		const players = ['Marc', 'Andrés', 'Raúl', 'Luis'].map(
			(name) =>
				new Player({
					name,
					nick: name.toLocaleLowerCase().replaceAll(/é/g, 'e').replaceAll(/ú/g, 'u'),
					color: colors[Generate.randomNumber(0, colors.length - 1)] ?? 'GOLD',
					icon: icons[Generate.randomNumber(0, icons.length - 1)] ?? 'SWORDS',
				}),
		);

		await this.gameRepository.insert('game', game.forRepository());
		await Promise.all(
			players.map((player) => this.playerRepository.insert('player', player.forRepository())),
		);
	}
}
