import { Component, inject } from '@angular/core';

import { PlayerColor, PlayerColorKey } from '@app/definition/model/player/player-color.enum';
import { PlayerIcon, PlayerIconKey } from '@app/definition/model/player/player-icon.enum';
import { ButtonDirective } from '@app/directive/button.directive';
import { RouterLinkDirective } from '@app/directive/router-link.directive';
import { SelectDirective } from '@app/directive/select/select.directive';
import { Game } from '@app/model/game.model';
import { Player } from '@app/model/player.model';
import { GameRepository } from '@app/repository/game.repository';
import { MatchRepository } from '@app/repository/match.repository';
import { PlayerRepository } from '@app/repository/player.repository';
import { Generate } from '@app/util/generate';

@Component({
	templateUrl: './dashboard.page.html',
	imports: [RouterLinkDirective, ButtonDirective, SelectDirective],
})
export class DashboardPage {
	private readonly gameRepository = inject(GameRepository);
	private readonly playerRepository = inject(PlayerRepository);
	private readonly matchRepository = inject(MatchRepository);

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

		await this.gameRepository.insert('game', game.toObject());
		await Promise.all(
			players.map((player) => this.playerRepository.insert('player', player.toObject())),
		);
	}

	async eraseAllData(): Promise<void> {
		await this.playerRepository.clear('player');
		await this.gameRepository.clear('game');
		await this.matchRepository.clear('match');
		await this.matchRepository.clear('match_player');
		await this.matchRepository.clear('match_event');
	}

	show(message: Event): void {
		const target = message.target as HTMLInputElement;

		alert(target.value);
	}
}
