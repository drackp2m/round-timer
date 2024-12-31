import {
	ComponentRef,
	Directive,
	ElementRef,
	OnInit,
	Renderer2,
	ViewContainerRef,
	inject,
	input,
} from '@angular/core';

import { SvgComponent } from '@app/component/svg.component';

@Directive({
	selector: 'button[appButton]',
	host: {
		'[attr.type]': 'type()',
	},
})
export class ButtonDirective implements OnInit {
	// Fixme => when create empty button @angular/eslint error occurs
	readonly type = input('button');
	readonly color = input('accent');
	readonly icon = input<string>();
	readonly iconSize = input<number>(24);

	private readonly elementRef: ElementRef<HTMLButtonElement> = inject(ElementRef);
	private readonly renderer2 = inject(Renderer2);
	private readonly viewContainerRef = inject(ViewContainerRef);

	ngOnInit() {
		this.createWrapper();
	}

	private createWrapper() {
		const buttonElement = this.elementRef.nativeElement;
		const icon = this.icon();

		this.renderer2.addClass(buttonElement, 'app-button');

		if (icon === undefined) {
			this.addClassForTextButton(buttonElement);
			this.renderer2.addClass(buttonElement, 'p-2');
		} else {
			this.renderer2.addClass(buttonElement, 'p-1');
			const iconElement = this.createIcon(icon);
			this.renderer2.appendChild(buttonElement, iconElement.location.nativeElement);
		}
	}

	private addClassForTextButton(buttonElement: HTMLButtonElement): void {
		const color = this.color();

		this.renderer2.addClass(buttonElement, 'px-3');
		this.renderer2.addClass(buttonElement, 'round-2');
		this.renderer2.addClass(buttonElement, `surface-${color}`);
		this.renderer2.addClass(buttonElement, this.getContrastColor(color));
		this.renderer2.addClass(buttonElement, 'color-primary');
	}
	private getContrastColor(color: string): string {
		switch (color) {
			case 'primary':
				return `color-contrast`;
			case 'primary-mid':
				return `color-contrast`;
			case 'contrast':
				return `color-primary`;
			case 'contrast-mid':
				return `color-primary`;
			case 'accent':
			default:
				return 'color-primary';
		}
	}

	private createIcon(icon: string): ComponentRef<SvgComponent> {
		const iconSize = this.iconSize();
		const color = this.color();

		const iconColor = `surface-${color}`;
		const iconElement = this.viewContainerRef.createComponent(SvgComponent);

		iconElement.setInput('icon', icon);
		iconElement.setInput('size', iconSize);
		iconElement.setInput('color', iconColor);

		return iconElement;
	}
}
