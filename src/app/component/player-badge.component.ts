import { Component, input } from '@angular/core';

import { Player } from '@app/definition/player/player.model';

import { SvgComponent } from './svg.component';

@Component({
	selector: 'app-player-badge',
	template: `
		<div class="badge">
			<app-svg [icon]="player().icon" [color]="player().color"></app-svg>
		</div>
	`,
	styles: ``,
	imports: [SvgComponent],
})
export class PlayerBadgeComponent {
	readonly player = input.required<Player>();
}
