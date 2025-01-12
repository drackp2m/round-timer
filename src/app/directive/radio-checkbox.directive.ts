import { Directive, ElementRef, OnInit, Renderer2, effect, inject, input } from '@angular/core';

@Directive({
	selector: 'input[appInput][type=radio], input[appInput][type=checkbox]',
})
export class RadioCheckboxDirective implements OnInit {
	readonly type = input.required<string>();
	readonly label = input.required<string | HTMLElement>();

	private readonly elementRef: ElementRef<HTMLInputElement> = inject(ElementRef);
	private readonly renderer2 = inject(Renderer2);

	private wrapperElement?: HTMLDivElement;
	private labelElement?: HTMLLabelElement;

	constructor() {
		effect(() => this.fillLabel(this.label()));
	}

	ngOnInit() {
		this.wrapperElement = this.createWrapper();
		this.labelElement = this.createLabel();
		this.prepareWrapper();
	}

	private prepareWrapper() {
		const label = this.label();
		const inputElement = this.elementRef.nativeElement;
		const nextSibling = inputElement.nextSibling;
		const parentElement = inputElement.parentNode;

		this.renderer2.removeChild(parentElement, inputElement);
		if ('string' === typeof label) {
			const span = this.labelElement?.querySelector('span');
			this.renderer2.insertBefore(this.labelElement, inputElement, span);
		} else {
			this.renderer2.appendChild(this.labelElement, inputElement);
			this.renderer2.appendChild(this.labelElement, label);
		}
		this.renderer2.appendChild(this.wrapperElement, this.labelElement);

		if (null !== nextSibling) {
			this.renderer2.insertBefore(parentElement, this.wrapperElement, nextSibling);
		} else {
			this.renderer2.appendChild(parentElement, this.wrapperElement);
		}
	}

	private createWrapper(): HTMLDivElement {
		const type = this.type();
		const container = this.renderer2.createElement('div');

		this.renderer2.addClass(container, `app-${type}`);

		return container;
	}

	private createLabel(): HTMLLabelElement {
		const label = this.renderer2.createElement('label');
		const labelInput = this.label();

		if ('string' === typeof labelInput) {
			const span = this.renderer2.createElement('span');
			this.renderer2.addClass(span, 'label');

			this.renderer2.appendChild(label, span);
		}

		return label;
	}

	private fillLabel(value: string | HTMLElement): void {
		if ('string' === typeof value) {
			this.renderer2.setProperty(this.labelElement?.querySelector('span'), 'textContent', value);
		}
	}
}
