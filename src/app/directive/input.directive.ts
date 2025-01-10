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

type InputDirectiveType = 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url';

@Directive({
	selector: 'input[appInput]',
})
export class InputDirective implements OnInit, AfterViewInit {
	// FixMe => input are not filled when write text on type number
	readonly type = input.required<InputDirectiveType>();
	readonly label = input('');
	readonly placeholder = input('');

	private readonly elementRef: ElementRef<HTMLInputElement> = inject(ElementRef);
	private readonly renderer2 = inject(Renderer2);

	private readonly wrapperElement: HTMLDivElement = this.createWrapper();
	private readonly labelElement: HTMLLabelElement = this.createLabel();
	private readonly fakeLabelElement: HTMLSpanElement = this.createFakeLabel();
	private readonly borderContainerElement: HTMLDivElement = this.createBorderContainer();
	private readonly labelContainerElement: HTMLDivElement = this.creteLabelContainer();
	private readonly placeholderElement: HTMLSpanElement = this.createPlaceholderSpan();

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
		this.prepareWrapper();
	}

	ngAfterViewInit() {
		const labelWidth = this.labelElement.querySelector('span')?.offsetWidth;
		const inputHeight = this.wrapperElement.offsetHeight;

		this.setCSSVariable('--label-width', `${labelWidth}px`);
		this.setCSSVariable('--input-height', `${inputHeight}px`);

		this.onInput();
	}

	private setCSSVariable(name: string, value: string) {
		this.wrapperElement?.style.setProperty(name, value);
	}

	private prepareWrapper() {
		const inputElement = this.elementRef.nativeElement;
		const nextSibling = inputElement.nextSibling;
		const parentElement = inputElement.parentNode;

		this.renderer2.addClass(inputElement, 'br-2');

		this.renderer2.removeChild(parentElement, inputElement);
		this.renderer2.appendChild(this.labelElement, inputElement);
		this.renderer2.appendChild(this.wrapperElement, this.labelElement);
		this.renderer2.appendChild(this.labelContainerElement, this.fakeLabelElement);
		this.renderer2.appendChild(this.borderContainerElement, this.placeholderElement);
		this.renderer2.appendChild(this.wrapperElement, this.borderContainerElement);
		this.renderer2.appendChild(this.wrapperElement, this.labelContainerElement);

		if (null !== nextSibling) {
			this.renderer2.insertBefore(parentElement, this.wrapperElement, nextSibling);
		} else {
			this.renderer2.appendChild(parentElement, this.wrapperElement);
		}
	}

	private createWrapper(): HTMLDivElement {
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
		const fakeLabel = this.renderer2.createElement('p');

		this.renderer2.addClass(fakeLabel, 'label');

		return fakeLabel;
	}

	private createBorderContainer(): HTMLDivElement {
		const element = this.renderer2.createElement('div');

		this.renderer2.addClass(element, 'border-container');

		return element;
	}

	private creteLabelContainer(): HTMLDivElement {
		const element = this.renderer2.createElement('div');

		this.renderer2.addClass(element, 'label-container');

		return element;
	}

	private createPlaceholderSpan(): HTMLSpanElement {
		const element = this.renderer2.createElement('span');

		this.renderer2.addClass(element, 'placeholder');

		return element;
	}

	private fillLabel(value: string): void {
		this.renderer2.setProperty(this.labelElement.querySelector('span'), 'textContent', value);
		this.renderer2.setProperty(this.wrapperElement.querySelector('.label'), 'textContent', value);
	}

	private fillPlaceholder(value: string): void {
		this.renderer2.setProperty(this.placeholderElement, 'textContent', value);
	}
}
