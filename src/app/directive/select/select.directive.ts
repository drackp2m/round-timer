/* eslint-disable max-lines */
import {
	AfterViewInit,
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

import { SelectOptionsComponent } from '@app/directive/select/component/select-options.component';
import { SelectKeyboardHandler } from '@app/directive/select/select-keyboard.handler';
import { SelectOptionsDomHelper } from '@app/directive/select/select-options-dom.helper';
import {
	SelectWrapperBuilder,
	SelectWrapperElements,
} from '@app/directive/select/select-wrapper-builder';
import { ViewportService } from '@app/service/viewport.service';

const TOP_POSITION_CLASS = 'position-top';

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

	private readonly wrapperBuilder = new SelectWrapperBuilder(this.renderer2, this.viewContainerRef);

	private readonly wrapper: SelectWrapperElements = {
		...this.wrapperBuilder.buildElements(),
		iconComponentRef: null,
	};

	private readonly optionsHelper = new SelectOptionsDomHelper(
		this.renderer2,
		this.elementRef.nativeElement,
		() => {
			this.onOptionConfirmed();
		},
	);

	private readonly keyboardHandler = new SelectKeyboardHandler({
		isOpen: () => this.isDropdownOpen(),
		openDropdown: () => {
			this.openCustomDropdown();
		},
		closeDropdown: () => {
			this.closeCustomDropdown();
		},
		toggleDropdown: () => {
			this.toggleCustomDropdown();
		},
		highlightNext: () => {
			this.optionsHelper.highlightNextOption();
		},
		highlightPrevious: () => {
			this.optionsHelper.highlightPreviousOption();
		},
		confirmHighlighted: () => {
			this.optionsHelper.confirmHighlightedOption();
		},
		highlightTabTarget: () => {
			this.optionsHelper.highlightFirstValidOptionIfNoneHighlighted();
		},
		findOptionStartingWith: (char) => {
			this.findOptionStartingWith(char);
		},
	});

	constructor() {
		effect(() => {
			this.viewportService.routerOutletScroll();
			this.viewportService.windowResized();

			this.updatePositionClass();
		});
	}

	@HostListener('focus')
	onFocus() {
		this.renderer2.addClass(this.wrapper.wrapperElement, 'focused');
	}

	@HostListener('blur')
	onBlur() {
		this.renderer2.removeClass(this.wrapper.wrapperElement, 'focused');
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
	onKeyDown(event: KeyboardEvent) {
		this.keyboardHandler.handle(event);
	}

	ngOnInit() {
		this.wrapper.iconComponentRef = this.wrapperBuilder.buildIcon();
		this.prepareWrapper();
	}

	ngAfterViewInit() {
		const labelWidth = this.wrapper.labelElement.querySelector('span')?.offsetWidth ?? '';
		const inputHeight = this.wrapper.wrapperElement.offsetHeight;

		this.setCSSVariable('--label-width', `${labelWidth.toString()}px`);
		this.setCSSVariable('--input-height', `${inputHeight.toString()}px`);

		this.updatePositionClass();

		const componentRef = this.viewContainerRef.createComponent(SelectOptionsComponent);
		const hostElement = componentRef.location.nativeElement as HTMLElement;
		const optionsContainer = hostElement.querySelector<HTMLDivElement>('.options-container');

		this.optionsHelper.setContainer(optionsContainer);
		this.optionsHelper.projectOptions();
		this.renderer2.appendChild(this.wrapper.wrapperElement, componentRef.location.nativeElement);
	}

	private isDropdownOpen(): boolean {
		return this.wrapper.wrapperElement.classList.contains('open');
	}

	private updatePositionClass(): void {
		const rect = this.wrapper.wrapperElement.getBoundingClientRect();
		const viewportHeight = window.innerHeight;

		const viewportMidpoint = viewportHeight / 2;
		const elementMidpoint = rect.top + rect.height / 2;

		const isCloserToTop = elementMidpoint < viewportMidpoint;

		this.renderer2.removeClass(this.wrapper.wrapperElement, TOP_POSITION_CLASS);

		if (!isCloserToTop) {
			this.renderer2.addClass(this.wrapper.wrapperElement, TOP_POSITION_CLASS);
		}
	}

	private setCSSVariable(name: string, value: string) {
		this.wrapper.wrapperElement.style.setProperty(name, value);
	}

	private prepareWrapper() {
		const selectElement = this.elementRef.nativeElement;
		const nextSibling = selectElement.nextSibling?.nextSibling ?? null;
		const parentElement = selectElement.parentNode;

		this.renderer2.removeChild(parentElement, selectElement);
		this.wrapperBuilder.mount(this.wrapper, selectElement);

		const label = this.label();
		this.fillLabel(label);

		const selectedOptionText = this.getCurrentSelectedText();
		this.fillSelectedOption(selectedOptionText);
		this.updateFilledClass();

		if (null !== nextSibling) {
			this.renderer2.insertBefore(parentElement, this.wrapper.wrapperElement, nextSibling);
		} else {
			this.renderer2.appendChild(parentElement, this.wrapper.wrapperElement);
		}
	}

	private fillLabel(value: string): void {
		this.renderer2.setProperty(this.wrapper.labelSpanElement, 'textContent', value);
		this.renderer2.setProperty(this.wrapper.fakeLabelElement, 'textContent', value);
	}

	private getCurrentSelectedText(): string {
		const selectElement = this.elementRef.nativeElement;
		const selectedOption = selectElement.options[selectElement.selectedIndex];

		return selectedOption?.textContent ?? '';
	}

	private fillSelectedOption(value: string): void {
		this.renderer2.setProperty(this.wrapper.selectedOptionElement, 'textContent', value);
	}

	private updateFilledClass(): void {
		const value = this.elementRef.nativeElement.value;

		if ('' === value) {
			this.renderer2.removeClass(this.wrapper.wrapperElement, 'filled');
		} else {
			this.renderer2.addClass(this.wrapper.wrapperElement, 'filled');
		}
	}

	private toggleCustomDropdown() {
		if (this.isDropdownOpen()) {
			this.closeCustomDropdown();
		} else {
			this.openCustomDropdown();
		}

		this.updatePositionClass();
	}

	private openCustomDropdown() {
		this.renderer2.addClass(this.wrapper.wrapperElement, 'open');

		window.addEventListener('mousedown', this.closeOnOutsideClick);
		this.wrapper.wrapperElement.addEventListener(
			'mousemove',
			this.optionsHelper.clearKeyboardHighlight,
		);

		this.optionsHelper.highlightInitialOption();
		this.updatePositionClass();
	}

	private closeCustomDropdown() {
		this.renderer2.removeClass(this.wrapper.wrapperElement, 'open');

		window.removeEventListener('mousedown', this.closeOnOutsideClick);
		this.wrapper.wrapperElement.removeEventListener(
			'mousemove',
			this.optionsHelper.clearKeyboardHighlight,
		);
	}

	private closeOnOutsideClick = (event: MouseEvent) => {
		if (!this.wrapper.wrapperElement.contains(event.target as Node)) {
			const willCauseFocusLoss = document.activeElement === this.elementRef.nativeElement;

			if (willCauseFocusLoss) {
				event.preventDefault();
				event.stopPropagation();
			}

			this.closeCustomDropdown();
			this.updatePositionClass();
		}
	};

	private onOptionConfirmed(): void {
		this.fillSelectedOption(this.getCurrentSelectedText());
		this.closeCustomDropdown();
	}

	private findOptionStartingWith(char: string) {
		// Implementation to search for options that start with a character
		console.log('Searching for option that starts with:', char);
	}
}
