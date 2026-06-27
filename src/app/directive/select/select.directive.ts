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
	selector: 'select[appThemed]',
})
// ToDo => add default placeholder as "Select an option"
export class SelectDirective implements OnInit, AfterViewInit {
	readonly label = input.required<string>();

	private readonly elementRef = inject<ElementRef<HTMLSelectElement>>(ElementRef);
	private readonly renderer2 = inject(Renderer2);
	private readonly viewContainerRef = inject(ViewContainerRef);
	private readonly viewportService = inject(ViewportService);

	private readonly wrapperElement: HTMLDivElement = this.createWrapper();
	private readonly labelSpanElement: HTMLSpanElement = createTypedElement(this.renderer2, 'span');
	private readonly labelElement: HTMLLabelElement = this.createLabel();
	private readonly fakeLabelElement: HTMLSpanElement = this.createFakeLabel();
	private readonly borderContainerElement: HTMLDivElement = this.createBorderContainer();
	private readonly labelContainerElement: HTMLDivElement = this.creteLabelContainer();
	private readonly selectedOptionElement: HTMLSpanElement = this.createSelectedOption();

	private readonly TOP_POSITION_CLASS = 'position-top';
	private readonly HIGHLIGHTED_CLASS = 'highlighted';
	private readonly KEYBOARD_NAVIGATION_CLASS = 'keyboard-navigation';

	private optionsContainer: HTMLElement | null = null;
	private highlightedOptionIndex: number | null = null;

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
		this.updateFilledClass();
	}

	@HostListener('mousedown', ['$event'])
	onMouseDown(event: MouseEvent) {
		event.preventDefault();
		this.elementRef.nativeElement.focus();
		this.toggleCustomDropdown();
	}

	@HostListener('keydown', ['$event'])
	// eslint-disable-next-line sonarjs/cognitive-complexity
	onKeyDown(event: KeyboardEvent) {
		const isOpen = this.wrapperElement.classList.contains('open');

		if ('Enter' === event.code) {
			if (isOpen) {
				event.preventDefault();
				this.confirmHighlightedOption();
			}

			return;
		}

		if ('Tab' === event.code) {
			if (isOpen) {
				event.preventDefault();
				this.highlightTabTarget();
			}

			return;
		}

		if (
			'Space' === event.code ||
			'Enter' === event.code ||
			'ArrowDown' === event.code ||
			'ArrowUp' === event.code ||
			'Escape' === event.code
		) {
			event.preventDefault();

			if ('Space' === event.code || 'Enter' === event.code) {
				this.toggleCustomDropdown();
			}

			if ('ArrowDown' === event.code) {
				if (isOpen) {
					this.selectNextOption();
				} else {
					this.openCustomDropdown();
					this.updatePositionClass();
				}
			}

			if ('ArrowUp' === event.code) {
				if (isOpen) {
					this.selectPreviousOption();
				} else {
					this.openCustomDropdown();
					this.updatePositionClass();
				}
			}

			if ('Escape' === event.code) {
				this.closeCustomDropdown();
			}
		}

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
		const hostElement = componentRef.location.nativeElement as HTMLElement;
		this.optionsContainer = hostElement.querySelector<HTMLDivElement>('.options-container');

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

		if (!isCloserToTop) {
			this.renderer2.addClass(this.wrapperElement, this.TOP_POSITION_CLASS);
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
		this.renderer2.appendChild(this.borderContainerElement, this.selectedOptionElement);
		this.renderer2.appendChild(this.borderContainerElement, iconElement.location.nativeElement);
		this.renderer2.appendChild(this.wrapperElement, this.borderContainerElement);
		this.renderer2.appendChild(this.wrapperElement, this.labelContainerElement);

		// ToDo => check if text change on language update

		const label = this.label();
		this.fillLabel(label);

		const selectedOptionText = this.getCurrentSelectedText();
		this.fillSelectedOption(selectedOptionText);
		this.updateFilledClass();

		if (null !== nextSibling) {
			this.renderer2.insertBefore(parentElement, this.wrapperElement, nextSibling);
		} else {
			this.renderer2.appendChild(parentElement, this.wrapperElement);
		}
	}

	private createWrapper(): HTMLDivElement {
		const element = createTypedElement(this.renderer2, 'div');

		this.renderer2.addClass(element, 'app-select');

		return element;
	}

	private createLabel(): HTMLLabelElement {
		const element = createTypedElement(this.renderer2, 'label');

		this.renderer2.appendChild(element, this.labelSpanElement);

		return element;
	}

	private createFakeLabel(): HTMLSpanElement {
		const element = createTypedElement(this.renderer2, 'p');

		this.renderer2.addClass(element, 'label');

		return element;
	}

	private createBorderContainer(): HTMLDivElement {
		const element = createTypedElement(this.renderer2, 'div');

		this.renderer2.addClass(element, 'border-container');
		this.renderer2.addClass(element, 'flex-row');
		this.renderer2.addClass(element, 'justify-between');
		this.renderer2.addClass(element, 'align-center');

		return element;
	}

	private creteLabelContainer(): HTMLDivElement {
		const element = createTypedElement(this.renderer2, 'div');

		this.renderer2.addClass(element, 'label-container');

		return element;
	}

	private createSelectedOption(): HTMLSpanElement {
		const element = createTypedElement(this.renderer2, 'span');

		this.renderer2.addClass(element, 'selected-option');

		return element;
	}

	private createIcon(): ComponentRef<SvgComponent> {
		const element = this.viewContainerRef.createComponent(SvgComponent);

		element.setInput('icon', 'chevron-down');
		element.setInput('size', 18);

		return element;
	}

	private fillLabel(value: string): void {
		this.renderer2.setProperty(this.labelSpanElement, 'textContent', value);
		this.renderer2.setProperty(this.fakeLabelElement, 'textContent', value);
	}

	private getCurrentSelectedText(): string {
		const selectElement = this.elementRef.nativeElement;
		const selectedOption = selectElement.options[selectElement.selectedIndex];

		return selectedOption?.textContent ?? '';
	}

	private fillSelectedOption(value: string): void {
		this.renderer2.setProperty(this.selectedOptionElement, 'textContent', value);
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

		window.addEventListener('mousedown', this.closeOnOutsideClick);
		this.optionsContainer?.addEventListener('mousemove', this.clearKeyboardHighlight);

		this.highlightInitialOption();
	}

	private closeCustomDropdown() {
		this.renderer2.removeClass(this.wrapperElement, 'open');

		window.removeEventListener('mousedown', this.closeOnOutsideClick);
		this.optionsContainer?.removeEventListener('mousemove', this.clearKeyboardHighlight);
	}

	private closeOnOutsideClick = (event: MouseEvent) => {
		if (!this.wrapperElement.contains(event.target as Node)) {
			console.log('closing dropdown because click was outside of wrapperElement');
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
		if (null === this.optionsContainer) {
			return;
		}

		const options = Array.from(this.optionsContainer.children) as HTMLDivElement[];
		const startIndex = this.highlightedOptionIndex ?? -1;

		for (let index = startIndex + 1; index < options.length; index++) {
			const itemAtIndex = options[index];
			if (undefined !== itemAtIndex && !itemAtIndex.classList.contains('disabled')) {
				this.highlightOptionAt(index);

				return;
			}
		}
	}

	private selectPreviousOption() {
		if (null === this.optionsContainer) {
			return;
		}

		const options = Array.from(this.optionsContainer.children) as HTMLDivElement[];
		const startIndex = this.highlightedOptionIndex ?? options.length;

		for (let index = startIndex - 1; 0 <= index; index--) {
			const itemAtIndex = options[index];
			if (undefined !== itemAtIndex && !itemAtIndex.classList.contains('disabled')) {
				this.highlightOptionAt(index);

				return;
			}
		}
	}

	private findOptionStartingWith(char: string) {
		console.log('Searching for option that starts with:', char);
		// Implementation to search for options that start with a character
	}

	private projectOptions(): void {
		if (null === this.optionsContainer) {
			return;
		}

		while (null !== this.optionsContainer.firstChild) {
			this.optionsContainer.removeChild(this.optionsContainer.firstChild);
		}

		Array.from(this.elementRef.nativeElement.options).forEach((option) => {
			// if ('' === option.value) {
			// 	return;
			// }

			const optionElement = createTypedElement(this.renderer2, 'div');
			this.renderer2.addClass(optionElement, 'option');

			if (option.disabled) {
				this.renderer2.addClass(optionElement, 'disabled');
			}

			if (option.value === this.elementRef.nativeElement.value) {
				this.renderer2.addClass(optionElement, 'selected');
			}

			this.renderer2.setProperty(optionElement, 'textContent', option.textContent);

			this.renderer2.setAttribute(optionElement, 'data-value', option.value);

			this.renderer2.appendChild(this.optionsContainer, optionElement);

			this.addEventListenersToOption(optionElement);
		});
	}

	private addEventListenersToOption(option: HTMLDivElement) {
		option.addEventListener('mousedown', (event) => {
			event.preventDefault();
		});

		option.addEventListener('click', () => {
			console.log('Option clicked:', option);
			const value = option.getAttribute('data-value');

			if (null !== value) {
				this.elementRef.nativeElement.value = value;
				this.updateSelectedOptionClass();
				this.fillSelectedOption(this.getCurrentSelectedText());
				this.closeCustomDropdown();
				this.elementRef.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
			}
		});
	}

	private updateFilledClass(): void {
		const value = this.elementRef.nativeElement.value;

		if ('' === value) {
			this.renderer2.removeClass(this.wrapperElement, 'filled');
		} else {
			this.renderer2.addClass(this.wrapperElement, 'filled');
		}
	}

	private highlightOptionAt(index: number): void {
		if (null === this.optionsContainer) {
			return;
		}

		const options = Array.from(this.optionsContainer.children) as HTMLDivElement[];

		if (0 > index || index >= options.length) {
			return;
		}

		if (null !== this.highlightedOptionIndex) {
			const currentlyHighlighted = options[this.highlightedOptionIndex];

			if (undefined !== currentlyHighlighted) {
				this.renderer2.removeClass(currentlyHighlighted, this.HIGHLIGHTED_CLASS);
			}
		}

		const nextHighlighted = options[index];

		this.renderer2.addClass(nextHighlighted, this.HIGHLIGHTED_CLASS);
		this.renderer2.addClass(this.optionsContainer, this.KEYBOARD_NAVIGATION_CLASS);
		nextHighlighted?.scrollIntoView({ block: 'nearest' });

		this.highlightedOptionIndex = index;
	}

	private highlightInitialOption(): void {
		if (null === this.optionsContainer) {
			return;
		}

		const options = Array.from(this.optionsContainer.children) as HTMLDivElement[];
		const selectedIndex = options.findIndex((option) => option.classList.contains('selected'));

		if (-1 !== selectedIndex) {
			this.highlightOptionAt(selectedIndex);

			return;
		}

		const firstEnabledIndex = options.findIndex((option) => !option.classList.contains('disabled'));

		if (-1 !== firstEnabledIndex) {
			this.highlightOptionAt(firstEnabledIndex);
		}
	}

	private confirmHighlightedOption(): void {
		if (null === this.optionsContainer || null === this.highlightedOptionIndex) {
			return;
		}

		const options = Array.from(this.optionsContainer.children) as HTMLDivElement[];
		const highlighted = options[this.highlightedOptionIndex];

		if (undefined === highlighted || highlighted.classList.contains('disabled')) {
			return;
		}

		highlighted.click();
	}

	private updateSelectedOptionClass(): void {
		if (null === this.optionsContainer) {
			return;
		}

		const options = Array.from(this.optionsContainer.children) as HTMLDivElement[];
		const currentValue = this.elementRef.nativeElement.value;

		options.forEach((option) => {
			const isSelected = option.getAttribute('data-value') === currentValue;

			if (isSelected) {
				this.renderer2.addClass(option, 'selected');
			} else {
				this.renderer2.removeClass(option, 'selected');
			}
		});
	}

	private clearKeyboardHighlight = (): void => {
		if (null === this.optionsContainer) {
			return;
		}

		this.renderer2.removeClass(this.optionsContainer, this.KEYBOARD_NAVIGATION_CLASS);

		if (null === this.highlightedOptionIndex) {
			return;
		}

		const options = Array.from(this.optionsContainer.children) as HTMLDivElement[];
		const currentlyHighlighted = options[this.highlightedOptionIndex];

		if (undefined !== currentlyHighlighted) {
			this.renderer2.removeClass(currentlyHighlighted, this.HIGHLIGHTED_CLASS);
		}

		this.highlightedOptionIndex = null;
	};

	private highlightTabTarget(): void {
		if (null === this.optionsContainer) {
			return;
		}

		const options = Array.from(this.optionsContainer.children) as HTMLDivElement[];
		const firstValidIndex = options.findIndex(
			(option) =>
				'' !== option.getAttribute('data-value') && !option.classList.contains('disabled'),
		);

		if (-1 !== firstValidIndex) {
			this.highlightOptionAt(firstValidIndex);
		}
	}
}
