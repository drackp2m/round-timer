import { ComponentRef, Renderer2, ViewContainerRef } from '@angular/core';

import { SvgComponent } from '@app/component/svg.component';
import { createTypedElement } from '@app/util/renderer';

export interface SelectWrapperElements {
	wrapperElement: HTMLDivElement;
	labelSpanElement: HTMLSpanElement;
	labelElement: HTMLLabelElement;
	fakeLabelElement: HTMLSpanElement;
	borderContainerElement: HTMLDivElement;
	labelContainerElement: HTMLDivElement;
	selectedOptionElement: HTMLSpanElement;
	iconComponentRef: ComponentRef<SvgComponent> | null;
}

/**
 * Builds the static DOM structure used to visually wrap a native <select>.
 * Pure construction logic: no directive state, only Renderer2/ViewContainerRef.
 */
export class SelectWrapperBuilder {
	constructor(
		private readonly renderer2: Renderer2,
		private readonly viewContainerRef: ViewContainerRef,
	) {}

	/**
	 * Builds the static DOM-only elements. Safe to call from a class
	 * property initializer (runs inside the constructor).
	 */
	buildElements(): Omit<SelectWrapperElements, 'iconComponentRef'> {
		const wrapperElement = this.createWrapper();
		const labelSpanElement = createTypedElement(this.renderer2, 'span');
		const labelElement = this.createLabel(labelSpanElement);
		const fakeLabelElement = this.createFakeLabel();
		const borderContainerElement = this.createBorderContainer();
		const labelContainerElement = this.createLabelContainer();
		const selectedOptionElement = this.createSelectedOption();

		return {
			wrapperElement,
			labelSpanElement,
			labelElement,
			fakeLabelElement,
			borderContainerElement,
			labelContainerElement,
			selectedOptionElement,
		};
	}

	/**
	 * Creates the icon component. Must be called from ngOnInit/ngAfterViewInit
	 * (or later), never from a constructor/property initializer - creating a
	 * real Angular component requires the view to already be set up.
	 */
	buildIcon(): ComponentRef<SvgComponent> {
		return this.createIcon();
	}

	/**
	 * Assembles the already-built elements together and mounts the native
	 * select inside them. Pure DOM wiring - no directive state involved.
	 */
	mount(elements: SelectWrapperElements, selectElement: HTMLSelectElement): void {
		const iconComponentRef = elements.iconComponentRef;

		if (null === iconComponentRef) {
			return;
		}

		this.renderer2.addClass(selectElement, 'br-2');

		this.renderer2.appendChild(elements.labelElement, selectElement);
		this.renderer2.appendChild(elements.wrapperElement, elements.labelElement);
		this.renderer2.appendChild(elements.labelContainerElement, elements.fakeLabelElement);
		this.renderer2.appendChild(elements.borderContainerElement, elements.selectedOptionElement);
		this.renderer2.appendChild(
			elements.borderContainerElement,
			iconComponentRef.location.nativeElement,
		);
		this.renderer2.appendChild(elements.wrapperElement, elements.borderContainerElement);
		this.renderer2.appendChild(elements.wrapperElement, elements.labelContainerElement);
	}

	private createWrapper(): HTMLDivElement {
		const element = createTypedElement(this.renderer2, 'div');

		this.renderer2.addClass(element, 'app-select');

		return element;
	}

	private createLabel(labelSpanElement: HTMLSpanElement): HTMLLabelElement {
		const element = createTypedElement(this.renderer2, 'label');

		this.renderer2.appendChild(element, labelSpanElement);

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

	private createLabelContainer(): HTMLDivElement {
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
}
