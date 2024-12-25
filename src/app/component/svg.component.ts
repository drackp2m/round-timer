import { Component, input } from '@angular/core';

@Component({
	selector: 'app-svg',
	template: `<div
		[attr.class]="color()"
		[style.height]="size()"
		[style.aspect-ratio]="aspectRatio()"
		[style.-webkit-mask]="icon()"
	></div>`,
})
export class SvgComponent {
	readonly icon = input.required<string, string>({ transform: this.getIcon });
	readonly color = input<string>('surface-contrast');
	readonly size = input<string, number>('24px', { transform: (size: number) => `${size}px` });

	getIcon(value: string): string {
		return `url(/svg/${value}-solid.svg) no-repeat center`;
	}

	aspectRatio(): string {
		const icon = this.icon();
		const iconNameRegex = /\/svg\/(.+)-solid.svg/;

		const match = iconNameRegex.exec(icon);

		const iconName = match?.[1];

		switch (iconName) {
			case 'backward-step':
			case 'forward-step':
			case 'pause':
				return '320 / 512';
			case 'stop':
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
