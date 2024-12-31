import {
	AfterViewInit,
	ComponentRef,
	Directive,
	ElementRef,
	HostListener,
	OnInit,
	Renderer2,
	ViewContainerRef,
	inject,
} from '@angular/core';

import { SvgComponent } from '@app/component/svg.component';

@Directive({
	selector: 'select[appSelect]',
})
export class SelectDirective implements OnInit, AfterViewInit {
	private readonly elementRef: ElementRef<HTMLSelectElement> = inject(ElementRef);
	private readonly renderer2 = inject(Renderer2);
	private readonly viewContainerRef = inject(ViewContainerRef);

	private readonly wrapperElement: HTMLDivElement = this.createWrapper();
	private readonly labelElement: HTMLLabelElement = this.createLabel();
	private readonly fakeLabelElement: HTMLSpanElement = this.createFakeLabel();
	private readonly borderContainerElement: HTMLDivElement = this.createBorderContainer();
	private readonly labelContainerElement: HTMLDivElement = this.creteLabelContainer();

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
	}

	private setCSSVariable(name: string, value: string) {
		this.wrapperElement?.style.setProperty(name, value);
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
		const container = this.renderer2.createElement('div');

		this.renderer2.addClass(container, 'app-select');

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
		const borderBox = this.renderer2.createElement('div');

		this.renderer2.addClass(borderBox, 'border-container');
		this.renderer2.addClass(borderBox, 'flex-row');
		this.renderer2.addClass(borderBox, 'justify-end');
		this.renderer2.addClass(borderBox, 'align-center');

		return borderBox;
	}

	private creteLabelContainer(): HTMLDivElement {
		const element = this.renderer2.createElement('div');

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
}
