import {
	AfterViewInit,
	DestroyRef,
	Directive,
	ElementRef,
	HostListener,
	OnInit,
	Renderer2,
	effect,
	inject,
	input,
} from '@angular/core';

import { createTypedElement } from '@app/util/renderer';

type InputDirectiveType = 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url';
const selector =
	'input[appThemed][type=email],' +
	'input[appThemed][type=number],' +
	'input[appThemed][type=password],' +
	'input[appThemed][type=search],' +
	'input[appThemed][type=tel],' +
	'input[appThemed][type=text],' +
	'input[appThemed][type=url]';

@Directive({
	selector,
})
export class InputDirective implements OnInit, AfterViewInit {
	// FixMe => input are not filled when write text on type number
	readonly type = input.required<InputDirectiveType>();
	readonly label = input('');
	readonly placeholder = input('');

	private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
	private readonly renderer2 = inject(Renderer2);
	private readonly destroyRef = inject(DestroyRef);

	private readonly wrapperElement: HTMLDivElement = this.createWrapper();
	private readonly labelSpanElement: HTMLSpanElement = createTypedElement(this.renderer2, 'span');
	private readonly labelElement: HTMLLabelElement = this.createLabel();
	private readonly fakeLabelElement: HTMLSpanElement = this.createFakeLabel();
	private readonly borderContainerElement: HTMLDivElement = this.createBorderContainer();
	private readonly labelContainerElement: HTMLDivElement = this.creteLabelContainer();
	private readonly placeholderElement: HTMLSpanElement = this.createPlaceholderSpan();

	constructor() {
		effect(() => {
			const label = this.label();
			this.fillLabel(label);
		});
		effect(() => {
			const placeholder = this.placeholder();
			this.fillPlaceholder(placeholder);
		});
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
		this.observeSizeChanges();
		this.observeDisabledChanges();
		this.onInput();
	}

	/**
	 * Same rationale as the select shell: the label width is not static
	 * (async translations, runtime language changes, late-loading web fonts),
	 * so the hidden measure span and the wrapper are re-measured on every
	 * size change — including the initial layout, since observers fire once
	 * on `observe()`.
	 */
	private observeSizeChanges(): void {
		const observer = new ResizeObserver(() => {
			this.applySizeVariables();
		});

		observer.observe(this.labelSpanElement);
		observer.observe(this.wrapperElement);

		this.destroyRef.onDestroy(() => {
			observer.disconnect();
		});
	}

	private applySizeVariables(): void {
		this.setCSSVariable('--label-width', `${this.labelSpanElement.offsetWidth.toString()}px`);
		this.setCSSVariable('--input-height', `${this.wrapperElement.offsetHeight.toString()}px`);
	}

	/**
	 * The `disabled` attribute lives on the native input (reactive forms,
	 * `[disabled]` bindings), but the themed styles hang off the wrapper the
	 * directive builds around it, so attribute changes are mirrored as a
	 * `.disabled` class.
	 */
	private observeDisabledChanges(): void {
		const observer = new MutationObserver(() => {
			this.syncDisabled();
		});

		observer.observe(this.elementRef.nativeElement, {
			attributes: true,
			attributeFilter: ['disabled'],
		});

		this.syncDisabled();

		this.destroyRef.onDestroy(() => {
			observer.disconnect();
		});
	}

	private syncDisabled(): void {
		if (this.elementRef.nativeElement.disabled) {
			this.renderer2.addClass(this.wrapperElement, 'disabled');
		} else {
			this.renderer2.removeClass(this.wrapperElement, 'disabled');
		}
	}

	private setCSSVariable(name: string, value: string) {
		this.wrapperElement.style.setProperty(name, value);
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
		const element = createTypedElement(this.renderer2, 'div');

		this.renderer2.addClass(element, 'app-input');

		return element;
	}

	private createLabel(): HTMLLabelElement {
		const element = createTypedElement(this.renderer2, 'label');
		this.renderer2.appendChild(element, this.labelSpanElement);

		return element;
	}

	private createFakeLabel(): HTMLSpanElement {
		const element = createTypedElement(this.renderer2, 'p') as HTMLSpanElement;

		this.renderer2.addClass(element, 'label');

		return element;
	}

	private createBorderContainer(): HTMLDivElement {
		const element = createTypedElement(this.renderer2, 'div');

		this.renderer2.addClass(element, 'border-container');
		this.renderer2.addClass(element, 'flex-row');

		return element;
	}

	private creteLabelContainer(): HTMLDivElement {
		const element = createTypedElement(this.renderer2, 'div');

		this.renderer2.addClass(element, 'label-container');

		return element;
	}

	private createPlaceholderSpan(): HTMLSpanElement {
		const element = createTypedElement(this.renderer2, 'span');

		this.renderer2.addClass(element, 'placeholder');

		return element;
	}

	private fillLabel(value: string): void {
		this.renderer2.setProperty(this.labelSpanElement, 'textContent', value);
		this.renderer2.setProperty(this.fakeLabelElement, 'textContent', value);
	}

	private fillPlaceholder(value: string): void {
		this.renderer2.setProperty(this.placeholderElement, 'textContent', value);
	}
}
