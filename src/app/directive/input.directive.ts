import {
	AfterViewInit,
	Directive,
	ElementRef,
	HostListener,
	OnInit,
	Renderer2,
	effect,
	inject,
	input,
} from '@angular/core';

@Directive({
	selector: 'input[appInput]',
	host: {
		'[attr.type]': 'type()',
	},
})
export class InputDirective implements OnInit, AfterViewInit {
	readonly type = input('text');
	readonly label = input('');
	readonly placeholder = input('');
	readonly icon = input<string>();

	private readonly elementRef: ElementRef<HTMLInputElement> = inject(ElementRef);
	private readonly renderer2 = inject(Renderer2);

	private readonly wrapperElement: HTMLDivElement = this.createContainer();
	private readonly labelElement: HTMLLabelElement = this.createLabel();
	private readonly fakeLabelElement: HTMLSpanElement = this.createFakeLabel();
	private readonly borderBox: HTMLDivElement = this.createBorderBox();
	private readonly labelBox: HTMLDivElement = this.creteLabelBox();
	private readonly placeholderElement: HTMLSpanElement = this.createPlaceholder();
	private readonly iconElement?: HTMLSpanElement;

	constructor() {
		effect(() => this.fillLabel(this.label()));
		effect(() => this.fillPlaceholder(this.placeholder()));
	}

	@HostListener('focus')
	onFocus() {
		this.renderer2.addClass(this.wrapperElement, 'focused');
	}

	@HostListener('blur')
	onBlur() {
		this.renderer2.removeClass(this.wrapperElement, 'focused');
	}

	@HostListener('input')
	@HostListener('change')
	onInput() {
		const value = this.elementRef.nativeElement.value;

		if ('' === value) {
			this.renderer2.removeClass(this.wrapperElement, 'filled');
		} else {
			this.renderer2.addClass(this.wrapperElement, 'filled');
		}
	}

	ngOnInit() {
		this.createWrapper();
	}

	ngAfterViewInit() {
		const labelWidth = this.labelElement.querySelector('span')?.offsetWidth;
		const inputHeight = this.wrapperElement.offsetHeight;

		this.setCSSVariable('--label-width', `${labelWidth}px`);
		this.setCSSVariable('--input-height', `${inputHeight}px`);
	}

	private setCSSVariable(name: string, value: string) {
		this.wrapperElement?.style.setProperty(name, value);
	}

	private createWrapper() {
		const inputElement = this.elementRef.nativeElement;
		const nextSibling = inputElement.nextSibling;
		const parentElement = inputElement.parentNode;

		this.renderer2.addClass(inputElement, 'round-2');

		this.renderer2.removeChild(parentElement, inputElement);
		this.renderer2.appendChild(this.labelElement, inputElement);
		this.renderer2.appendChild(this.wrapperElement, this.labelElement);
		this.renderer2.appendChild(this.labelBox, this.fakeLabelElement);
		this.renderer2.appendChild(this.borderBox, this.placeholderElement);
		this.renderer2.appendChild(this.wrapperElement, this.borderBox);
		this.renderer2.appendChild(this.wrapperElement, this.labelBox);

		if (null !== nextSibling) {
			this.renderer2.insertBefore(parentElement, this.wrapperElement, nextSibling);
		} else {
			this.renderer2.appendChild(parentElement, this.wrapperElement);
		}
	}

	private createContainer(): HTMLDivElement {
		const container = this.renderer2.createElement('div');

		this.renderer2.addClass(container, 'app-input');

		return container;
	}

	private createLabel(): HTMLLabelElement {
		const label = this.renderer2.createElement('label');
		const span = this.renderer2.createElement('span');

		this.renderer2.appendChild(label, span);

		return label;
	}

	private createFakeLabel(): HTMLSpanElement {
		const fakeLabel = this.renderer2.createElement('span');

		this.renderer2.addClass(fakeLabel, 'label');

		return fakeLabel;
	}

	private createBorderBox(): HTMLDivElement {
		const boderBox = this.renderer2.createElement('div');

		this.renderer2.addClass(boderBox, 'border-box');

		return boderBox;
	}

	private creteLabelBox(): HTMLDivElement {
		const box = this.renderer2.createElement('div');

		this.renderer2.addClass(box, 'label-box');

		return box;
	}

	private createPlaceholder(): HTMLSpanElement {
		const placeholder = this.renderer2.createElement('span');

		this.renderer2.addClass(placeholder, 'placeholder');

		return placeholder;
	}

	private fillLabel(value: string): void {
		this.renderer2.setProperty(this.labelElement.querySelector('span'), 'textContent', value);
		this.renderer2.setProperty(this.wrapperElement.querySelector('.label'), 'textContent', value);
	}

	private fillPlaceholder(value: string): void {
		this.renderer2.setProperty(this.placeholderElement, 'textContent', value);
	}

	// private addIcon(value: string): void {
	// 	this.iconElement = this.renderer2.createElement('span');
	// 	this.renderer2.addClass(this.iconElement, 'icon');
	// 	this.renderer2.setProperty(this.iconElement, 'textContent', value);
	// 	this.renderer2.appendChild(this.wrapperElement!, this.iconElement);
	// }
}
