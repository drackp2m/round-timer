import { Component, computed, input } from '@angular/core';
import { Check } from '@app/util/check';

@Component({
	selector: 'app-svg',
	template: `<div
		[attr.class]="color()"
		[style.aspect-ratio]="aspectRatio()"
		[style.mask]="icon()"
		[style.background-color]="hexColor()"
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
				}
			}
		`,
	],
	host: {
		'[attr.class]': 'squared() ? "squared" : ""',
		'[style.height]': 'size()',
	},
})
// ToDo => try to inherit color from parent text color
export class SvgComponent {
	readonly icon = input.required<string, string>({ transform: this.getIcon });
	readonly color = input<string>('surface-contrast');
	readonly hexColor = input<string>('--var(--color-contrast)');
	readonly squared = input(false, { transform: Check.isFalseAsStringOrTrue });
	readonly size = input<string, number>('24px', { transform: (size) => `${size}px` });

	readonly aspectRatio = computed(() => this.getAspectRatio());

	getIcon(value: string): string {
		return `url(/svg/${value}-solid.svg) no-repeat center`;
	}

	private getAspectRatio(): string {
		const icon = this.icon();
		const iconNameRegex = /\/svg\/(.+)-solid.svg/;

		const match = iconNameRegex.exec(icon);

		const iconName = match?.[1];

		switch (iconName) {
			case 'backward-step':
			case 'forward-step':
			case 'pause':
			case 'chevron-left':
			case 'chevron-right':
				return '320 / 512';
			case 'ghost':
			case 'stop':
			case 'xmark':
				return '384 / 512';
			case 'trash':
				return '448 / 512';
			case 'user-plus':
				return '640 / 512';
			default:
				return '1 / 1';
		}
	}
}
