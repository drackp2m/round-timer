import { Component, computed, input } from '@angular/core';
import { Player } from '@app/model/player.model';

import { PlayerColor } from '@app/definition/player/player-color.enum';
import { PlayerIcon } from '@app/definition/player/player-icon.enum';

import { SvgComponent } from './svg.component';

@Component({
	selector: 'app-player-badge',
	template: `
		<div class="badge flex-col align-center gap-2">
			<app-svg [icon]="icon()" [hexColor]="color() ?? ''" [size]="42" />
			{{ player().nick || 'unknown' }}
		</div>
	`,
	imports: [SvgComponent],
})
export class PlayerBadgeComponent {
	readonly player = input.required<Partial<Player>>();

	readonly icon = computed(() => {
		const player = this.player();

		if (player.icon === undefined) {
			return 'user-plus';
		}

		return PlayerIcon[player.icon];
	});

	readonly color = computed(() => {
		const player = this.player();

		if (undefined === player.color) {
			return undefined;
		}

		const color = player.color as unknown as keyof typeof PlayerColor;

		return PlayerColor[color];
	});
}
