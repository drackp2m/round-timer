/* eslint-disable max-lines */
import {
	AfterViewInit,
	ComponentRef,
	Directive,
	ElementRef,
	HostListener,
	OnInit,
	Renderer2,
	ViewContainerRef,
	effect,
	inject,
	input,
} from '@angular/core';

import { SvgComponent } from '@app/component/svg.component';
import { SelectOptionsComponent } from '@app/directive/select/component/select-options.component';
import { ViewportService } from '@app/service/viewport.service';
import { createTypedElement } from '@app/util/renderer';

@Directive({
	standalone: true,
	selector: 'select[appThemed]',
})
// ToDo => add default placeholder as "Select an option"
export class SelectDirective implements OnInit, AfterViewInit {
	private readonly elementRef = inject<ElementRef<HTMLSelectElement>>(ElementRef);
	private readonly renderer2 = inject(Renderer2);
	private readonly viewContainerRef = inject(ViewContainerRef);
	private readonly viewportService = inject(ViewportService);

	private readonly wrapperElement: HTMLDivElement = this.createWrapper();
	private readonly labelElement: HTMLLabelElement = this.createLabel();
	private readonly fakeLabelElement: HTMLSpanElement = this.createFakeLabel();
	private readonly borderContainerElement: HTMLDivElement = this.createBorderContainer();
	private readonly labelContainerElement: HTMLDivElement = this.creteLabelContainer();

	private readonly TOP_POSITION_CLASS = 'position-top';
	private readonly BOTTOM_POSITION_CLASS = 'position-bottom';

	private optionsContainer: HTMLElement | null = null;

	constructor() {
		effect(() => {
			this.viewportService.routerOutletScroll();
			this.viewportService.windowResized();

			this.updatePositionClass();
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

	@HostListener('mousedown', ['$event'])
	onMouseDown(event: MouseEvent) {
		event.preventDefault();
		this.elementRef.nativeElement.focus();
		this.toggleCustomDropdown();
	}

	@HostListener('keydown', ['$event'])
	onKeyDown(event: KeyboardEvent) {
		if (
			'Space' === event.code ||
			'Enter' === event.code ||
			'ArrowDown' === event.code ||
			'ArrowUp' === event.code
		) {
			event.preventDefault();

			if ('Space' === event.code || 'Enter' === event.code) {
				this.toggleCustomDropdown();
			}

			// Navegar por las opciones con flechas
			if ('ArrowDown' === event.code) {
				this.selectNextOption();
			}
			if ('ArrowUp' === event.code) {
				this.selectPreviousOption();
			}
		}

		// También puedes implementar la búsqueda rápida por primera letra
		if (/^[a-z0-9]$/i.test(event.key)) {
			this.findOptionStartingWith(event.key);
		}
	}

	ngOnInit() {
		this.prepareWrapper();
	}

	ngAfterViewInit() {
		const labelWidth = this.labelElement.querySelector('span')?.offsetWidth ?? '';
		const inputHeight = this.wrapperElement.offsetHeight;

		this.setCSSVariable('--label-width', `${labelWidth.toString()}px`);
		this.setCSSVariable('--input-height', `${inputHeight.toString()}px`);

		this.updatePositionClass();

		const componentRef = this.viewContainerRef.createComponent(SelectOptionsComponent);
		this.optionsContainer = componentRef.location.nativeElement.querySelector('.options-container');
		this.projectOptions();
		this.renderer2.appendChild(this.wrapperElement, componentRef.location.nativeElement);
	}

	private updatePositionClass(): void {
		const rect = this.wrapperElement.getBoundingClientRect();
		const viewportHeight = window.innerHeight;

		const viewportMidpoint = viewportHeight / 2;
		const elementMidpoint = rect.top + rect.height / 2;

		const isCloserToTop = elementMidpoint < viewportMidpoint;

		this.renderer2.removeClass(this.wrapperElement, this.TOP_POSITION_CLASS);
		this.renderer2.removeClass(this.wrapperElement, this.BOTTOM_POSITION_CLASS);

		if (isCloserToTop) {
			this.renderer2.addClass(this.wrapperElement, this.TOP_POSITION_CLASS);
		} else {
			this.renderer2.addClass(this.wrapperElement, this.BOTTOM_POSITION_CLASS);
		}
	}

	private setCSSVariable(name: string, value: string) {
		this.wrapperElement.style.setProperty(name, value);
	}

	private prepareWrapper() {
		const selectElement = this.elementRef.nativeElement;
		const nextSibling = selectElement.nextSibling;
		const parentElement = selectElement.parentNode;

		const iconElement = this.createIcon();

		this.renderer2.addClass(selectElement, 'br-2');

		this.renderer2.removeChild(parentElement, selectElement);
		this.renderer2.appendChild(this.labelElement, selectElement);
		this.renderer2.appendChild(this.wrapperElement, this.labelElement);
		this.renderer2.appendChild(this.labelContainerElement, this.fakeLabelElement);
		this.renderer2.appendChild(this.borderContainerElement, iconElement.location.nativeElement);
		this.renderer2.appendChild(this.wrapperElement, this.borderContainerElement);
		this.renderer2.appendChild(this.wrapperElement, this.labelContainerElement);

		// ToDo => check if text change on language update
		const selectLabel = this.getSelectLabel();
		this.fillLabel(selectLabel);

		if (null !== nextSibling) {
			this.renderer2.insertBefore(parentElement, this.wrapperElement, nextSibling);
		} else {
			this.renderer2.appendChild(parentElement, this.wrapperElement);
		}
	}

	private createWrapper(): HTMLDivElement {
		const container = createTypedElement(this.renderer2, 'div');

		this.renderer2.addClass(container, 'app-select');

		return container;
	}

	private createLabel(): HTMLLabelElement {
		const label = createTypedElement(this.renderer2, 'label');
		const span = createTypedElement(this.renderer2, 'span');

		this.renderer2.appendChild(label, span);

		return label;
	}

	private createFakeLabel(): HTMLSpanElement {
		const fakeLabel = createTypedElement(this.renderer2, 'p');

		this.renderer2.addClass(fakeLabel, 'label');

		return fakeLabel;
	}

	private createBorderContainer(): HTMLDivElement {
		const borderBox = createTypedElement(this.renderer2, 'div');

		this.renderer2.addClass(borderBox, 'border-container');
		this.renderer2.addClass(borderBox, 'flex-row');
		this.renderer2.addClass(borderBox, 'justify-end');
		this.renderer2.addClass(borderBox, 'align-center');

		return borderBox;
	}

	private creteLabelContainer(): HTMLDivElement {
		const element = createTypedElement(this.renderer2, 'div');

		this.renderer2.addClass(element, 'label-container');

		return element;
	}

	private createIcon(): ComponentRef<SvgComponent> {
		const icon = this.viewContainerRef.createComponent(SvgComponent);

		icon.setInput('icon', 'chevron-down');
		icon.setInput('size', 18);

		return icon;
	}

	private getSelectLabel(): string {
		const defaultLabel = 'Select an option';
		const options = this.elementRef.nativeElement.options;

		for (const option of options) {
			if ('' === option.value) {
				return option.textContent ?? defaultLabel;
			}
		}

		return defaultLabel;
	}

	private fillLabel(value: string): void {
		this.renderer2.setProperty(this.labelElement.querySelector('span'), 'textContent', value);
		this.renderer2.setProperty(this.wrapperElement.querySelector('.label'), 'textContent', value);
	}

	// IA methods
	private toggleCustomDropdown() {
		const isOpen = this.wrapperElement.classList.contains('open');

		if (isOpen) {
			this.closeCustomDropdown();
		} else {
			this.openCustomDropdown();
		}

		this.updatePositionClass();
	}

	private openCustomDropdown() {
		this.renderer2.addClass(this.wrapperElement, 'open');

		setTimeout(() => {
			window.addEventListener('mousedown', this.closeOnOutsideClick);
		});
	}

	private closeCustomDropdown() {
		this.renderer2.removeClass(this.wrapperElement, 'open');

		window.removeEventListener('mousedown', this.closeOnOutsideClick);
	}

	private closeOnOutsideClick = (event: MouseEvent) => {
		if (!this.wrapperElement.contains(event.target as Node)) {
			const willCauseFocusLoss = document.activeElement === this.elementRef.nativeElement;

			if (willCauseFocusLoss) {
				event.preventDefault();
				event.stopPropagation();
			}

			this.closeCustomDropdown();
			this.updatePositionClass();
		}
	};

	private selectNextOption() {
		// Implementación para seleccionar la siguiente opción
	}

	private selectPreviousOption() {
		// Implementación para seleccionar la opción anterior
	}

	private findOptionStartingWith(char: string) {
		console.log('Buscando opción que comienza con:', char);
		// Implementación para buscar opciones que comiencen con un carácter
	}

	private projectOptions(): void {
		if (null === this.optionsContainer) {
			return;
		}

		// while (null !== this.optionsContainer.firstChild) {
		// 	this.optionsContainer.removeChild(this.optionsContainer.firstChild);
		// }

		Array.from(this.elementRef.nativeElement.options).forEach((option) => {
			const optionEl = createTypedElement(this.renderer2, 'div');
			this.renderer2.addClass(optionEl, 'option');

			if (option.disabled) {
				this.renderer2.addClass(optionEl, 'disabled');
			}

			if (option.value === this.elementRef.nativeElement.value) {
				this.renderer2.addClass(optionEl, 'selected');
			}

			this.renderer2.setProperty(optionEl, 'textContent', option.textContent ?? '');

			this.renderer2.setAttribute(optionEl, 'data-value', option.value);

			this.renderer2.appendChild(this.optionsContainer, optionEl);

			this.addEventListenersToOption(optionEl);
		});
	}

	private addEventListenersToOption(option: HTMLDivElement) {
		option.addEventListener('click', () => {
			const value = option.getAttribute('data-value');

			if (null !== value) {
				this.elementRef.nativeElement.value = value;
				this.fillLabel(option.textContent ?? '');
				this.closeCustomDropdown();
				// trigger select change event
				this.elementRef.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
			}
		});
	}
}
