import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';

import { RadioCheckboxDirective } from '@app/directive/radio-checkbox/radio-checkbox.directive';
import { Game } from '@app/model/game.model';
import { Player } from '@app/model/player.model';
import { ShortenUuidPipe } from '@app/pipe/shorten-uuid.pipe';

@Component({
	templateUrl: './backup-conflict.page.html',
	styleUrl: './backup-conflict.page.scss',
	imports: [RadioCheckboxDirective, ShortenUuidPipe, DatePipe],
})
export class BackupConflictPage {
	readonly players: Player[][] = [
		[
			new Player({
				nick: 'player1',
				name: 'Some name',
				color: 'CADET_BLUE',
				icon: 'STAFF',
			}),
			new Player({
				nick: 'player1',
				name: 'Other name',
				color: 'DARK_ORANGE',
				icon: 'SWORDS',
			}),
		],
		[
			new Player({
				nick: 'player4',
				name: 'Some name',
				color: 'LIGHT_GRAY',
				icon: 'GHOST',
			}),
			new Player({
				nick: 'player4',
				name: 'Other name',
				color: 'CRIMSON',
				icon: 'SWORDS',
			}),
		],
	];

	readonly games: Game[][] = [
		[
			new Game({
				name: 'Game 1',
				maxPlayers: 4,
				turnOrder: 'ALWAYS_FIXED',
				turnType: 'PASS_ONCE',
				victoryType: 'COMPETITIVE',
			}),
			new Game({
				name: 'Game 1',
				maxPlayers: 3,
				turnOrder: 'EACH_ROUND_DIFFERENT',
				turnType: 'EQUITABLE',
				victoryType: 'TEAM_COMPETITIVE',
			}),
		],
	];
}
