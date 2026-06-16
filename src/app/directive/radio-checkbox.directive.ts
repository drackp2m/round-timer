import { Directive, ElementRef, OnInit, Renderer2, effect, inject, input } from '@angular/core';

import { createTypedElement } from '@app/util/renderer';

@Directive({
	selector: 'input[appThemed][type=radio], input[appThemed][type=checkbox]',
})
export class RadioCheckboxDirective implements OnInit {
	readonly type = input.required<string>();
	readonly label = input.required<string | HTMLElement>();

	private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
	private readonly renderer2 = inject(Renderer2);

	private wrapperElement?: HTMLDivElement;
	private labelElement?: HTMLLabelElement;

	constructor() {
		effect(() => {
			const label = this.label();
			this.fillLabel(label);
		});
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
		const container = createTypedElement(this.renderer2, 'div');

		this.renderer2.addClass(container, `app-${type}`);

		return container;
	}

	private createLabel(): HTMLLabelElement {
		const label = createTypedElement(this.renderer2, 'label');
		const labelInput = this.label();

		if ('string' === typeof labelInput) {
			const span = createTypedElement(this.renderer2, 'span');
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
