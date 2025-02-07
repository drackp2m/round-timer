import { Component, computed, input, signal } from '@angular/core';

import { SquaredDirective } from '@app/directive/squared.directive';
import { Check } from '@app/util/check';

@Component({
	selector: 'app-svg',
	template: `<div
		[attr.class]="class()"
		[style.aspect-ratio]="aspectRatio()"
		[style.mask]="icon()"
		[style.background-color]="'currentColor'"
	></div>`,
	styles: [
		`
			:host {
				display: flex;
				justify-content: center;

				&.squared {
					aspect-ratio: 1 / 1;
				}

				div {
					height: 100%;

					&.flip {
						transform: scaleX(-1);
					}
				}
			}
		`,
	],
	hostDirectives: [
		{
			directive: SquaredDirective,
			inputs: ['squared'],
		},
	],
	host: {
		'[style.height]': 'size()',
	},
})
// ToDo => try to inherit color from parent text color
export class SvgComponent {
	readonly icon = input.required<string, string>({ transform: this.getIcon });
	readonly flip = input(false, { transform: Check.isFalseAsStringOrTrue });
	readonly size = input<string, number>('24px', { transform: (size) => `${size.toString()}px` });

	readonly color = signal('surface-contrast');
	readonly hexColor = signal('surface-contrast');

	readonly aspectRatio = computed(() => this.getAspectRatio());
	readonly class = computed(() => {
		const color = this.color();
		const flip = this.flip();

		return color + (flip ? ' flip' : '');
	});

	getIcon(value: string): string {
		return `url(svg/${value}-solid.svg) no-repeat center`;
	}

	private getAspectRatio(): string {
		const icon = this.icon();

		const iconNameRegex = /svg\/(.+)-solid.svg/;

		const match = iconNameRegex.exec(icon);

		const iconName = match?.[1];

		switch (iconName) {
			case 'backward-step':
			case 'chevron-left':
			case 'chevron-right':
			case 'forward-step':
			case 'pause':
				return '320 / 512';
			case 'ghost':
			case 'play':
			case 'stop':
			case 'xmark':
				return '384 / 512';
			case 'rabbit':
			case 'trash':
				return '448 / 512';
			case 'turtle':
				return '512 / 398';
			case 'delete-left':
				return '576 / 512';
			case 'dice':
			case 'user-plus':
				return '640 / 512';
			default:
				return '1 / 1';
		}
	}
}
