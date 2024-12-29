import { Component, computed, input } from '@angular/core';

import { SvgComponent } from './svg.component';

@Component({
	selector: 'app-button',
	template: `@let iconSignal = icon();
		<button [class]="buttonClass()">
			@if (iconSignal === undefined) {
				<ng-content />
			} @else {
				<app-svg [icon]="iconSignal" [color]="svgClass()" [size]="size()" />
			}
		</button>`,
	styles: [
		`
			:host {
				display: contents;
			}
		`,
	],
	imports: [SvgComponent],
})
export class ButtonComponent {
	readonly color = input('accent');
	readonly icon = input<string>();
	readonly size = input<number>(24);

	readonly buttonClass = computed(() => this.getButtonClass());
	readonly svgClass = computed(() => this.getSvgClass());

	private getButtonClass(): string {
		const color = this.color();
		const icon = this.icon();

		const paddingClass = icon === undefined ? 'p-1 px-3 round-2' : 'p-1';
		const colorClass = icon === undefined ? this.getColor(color) : '';

		return `${paddingClass} ${colorClass}`;
	}

	private getSvgClass(): string {
		const color = this.color();

		const value = this.getColor(color);

		return value.split(' ')[0] ?? value;
	}

	private getColor(color: string): string {
		switch (color) {
			case 'primary':
				return `surface-${color} color-contrast`;
			case 'primary-mid':
				return `surface-${color} color-contrast`;
			case 'contrast':
				return `surface-${color} color-primary`;
			case 'contrast-mid':
				return `surface-${color} color-primary`;
			case 'accent':
			default:
				return 'surface-accent color-primary';
		}
	}
}
