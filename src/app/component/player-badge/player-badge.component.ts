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
	readonly player = input.required<Player>();
	readonly debug = input(false, { transform: Check.isFalseAsStringOrTrue });

	private readonly elementRef: ElementRef<Element> = inject(ElementRef);

	readonly icon = computed(() => PlayerIcon[this.player().icon] ?? 'user-plus');
	readonly color = computed(() => PlayerColor[this.player().color] ?? 'var(--color-contrast-mid)');

	readonly backgroundColor = signal('var(--color-primary)');

	readonly UUID = crypto.randomUUID();
	readonly size = signal(72);
	readonly svgSize = signal(0);
	readonly viewBox = computed(() => `0 0 ${this.svgSize()} ${this.svgSize()}`);
	readonly fontSize = signal(0);
	readonly createCircle = computed(() => {
		const size = this.svgSize();
		const fontSize = this.fontSize();

		const margin = fontSize;
		const radius = size / 2;

		// M 50 4 A 46 46 0 1 0 50.001 4
		// const move = ['M', radius, margin];
		// const arc = ['A', radius - margin, radius - margin, 0, 1, 0, radius + 0.001, margin];

		// M 50 104 A 46 46 0 1 1 50.001 104
		const move = ['M', radius, size - margin];
		const arc = ['A', radius - margin, radius - margin, 0, 1, 1, radius + 0.001, size - margin];

		return [...move, ...arc].join(' ');
	});

	ngAfterViewInit(): void {
		void Async.waitForFrames().then(() => {
			const element = this.elementRef;

			const fontSize = window.getComputedStyle(element.nativeElement).fontSize;

			this.svgSize.set(element.nativeElement.clientWidth);
			this.fontSize.set(parseInt(fontSize, 10));
		});
	}
}
