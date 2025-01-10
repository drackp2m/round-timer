import { Directive, ElementRef, OnInit, Renderer2, effect, inject, input } from '@angular/core';

type InputDirectiveType = 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url';

@Directive({
	selector: 'input[appRadio]',
	host: {
		'[attr.type]': 'type()',
	},
})
export class RadioDirective implements OnInit {
	// FixMe => input are not filled when write text on type number
	readonly type = input.required<'radio'>();
	readonly label = input.required<string>();

	private readonly elementRef: ElementRef<HTMLInputElement> = inject(ElementRef);
	private readonly renderer2 = inject(Renderer2);

	private readonly wrapperElement: HTMLDivElement = this.createWrapper();
	private readonly labelElement: HTMLLabelElement = this.createLabel();

	constructor() {
		effect(() => this.fillLabel(this.label()));
	}

	ngOnInit() {
		this.prepareWrapper();
	}

	private prepareWrapper() {
		const inputElement = this.elementRef.nativeElement;
		const nextSibling = inputElement.nextSibling;
		const parentElement = inputElement.parentNode;

		this.renderer2.addClass(inputElement, 'br-2');

		const span = this.labelElement.querySelector('span');

		this.renderer2.removeChild(parentElement, inputElement);
		this.renderer2.insertBefore(this.labelElement, inputElement, span);
		this.renderer2.appendChild(this.wrapperElement, this.labelElement);

		if (null !== nextSibling) {
			this.renderer2.insertBefore(parentElement, this.wrapperElement, nextSibling);
		} else {
			this.renderer2.appendChild(parentElement, this.wrapperElement);
		}
	}

	private createWrapper(): HTMLDivElement {
		const container = this.renderer2.createElement('div');

		this.renderer2.addClass(container, 'app-radio');

		return container;
	}

	private createLabel(): HTMLLabelElement {
		const label = this.renderer2.createElement('label');
		const span = this.renderer2.createElement('span');

		this.renderer2.appendChild(label, span);

		return label;
	}

	private fillLabel(value: string): void {
		this.renderer2.setProperty(this.labelElement.querySelector('span'), 'textContent', value);
	}
}
