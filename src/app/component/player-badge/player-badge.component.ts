import {
	AfterViewInit,
	Component,
	ElementRef,
	computed,
	inject,
	input,
	signal,
} from '@angular/core';

import { SvgComponent } from '@app/component/svg.component';
import { PlayerColor } from '@app/definition/model/player/player-color.enum';
import { PlayerIcon } from '@app/definition/model/player/player-icon.enum';
import { Player } from '@app/model/player.model';
import { Async } from '@app/util/async';
import { Check } from '@app/util/check';

@Component({
	selector: 'app-player-badge',
	templateUrl: './player-badge.component.html',
	styleUrl: './player-badge.component.scss',
	imports: [SvgComponent],
})
export class PlayerBadgeComponent implements AfterViewInit {
	readonly player = input.required<Partial<Player>>();
	readonly debug = input(false, { transform: Check.isFalseAsStringOrTrue });

	private readonly elementRef = inject<ElementRef<Element>>(ElementRef);

	readonly icon = computed(() => {
		const player = this.player();

		return undefined !== player.icon ? PlayerIcon[player.icon] : 'user-plus';
	});
	readonly color = computed(() => {
		const player = this.player();

		return player.color !== undefined ? PlayerColor[player.color] : 'var(--color-contrast-mid)';
	});

	readonly backgroundColor = signal('var(--color-primary)');

	readonly UUID = crypto.randomUUID();
	readonly size = signal(72);
	readonly viewBox = computed(() => `0 0 ${this.size().toString()} ${this.size().toString()}`);
	readonly fontSize = signal(0);
	readonly createTopCircle = computed(() => {
		const size = this.size();

		const margin = this.fontSize() - 1;

		const move = ['M', size - margin, size / 2];
		const arc = ['A', size / 2 - margin, size / 2 - margin, 0, 1, 1, margin, size / 2];

		return [...move, ...arc].join(' ');
	});
	readonly createBottomCircle = computed(() => {
		const size = this.size();

		const margin = this.fontSize() - 1;

		const move = ['M', margin, size / 2];
		const arc = ['A', size / 2 - margin, size / 2 - margin, 0, 1, 1, size - margin, size / 2];

		return [...move, ...arc].join(' ');
	});

	ngAfterViewInit(): void {
		void Async.waitForFrames(2).then(() => {
			const element = this.elementRef.nativeElement.querySelector('.badge');

			if (null === element) {
				return;
			}

			const size = element.clientWidth + 3 * 2;

			this.size.set(size);
			this.fontSize.set(size * 0.15);
		});
	}
}
