import {
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
export class SelectDirective implements OnInit {
	private readonly elementRef: ElementRef<HTMLSelectElement> = inject(ElementRef);
	private readonly renderer2 = inject(Renderer2);
	private readonly viewContainerRef = inject(ViewContainerRef);

	private readonly wrapperElement: HTMLDivElement = this.createContainer();
	private readonly borderBox: HTMLDivElement = this.createBorderBox();

	@HostListener('focus')
	onFocus() {
		this.renderer2.addClass(this.wrapperElement, 'focused');
	}

	@HostListener('blur')
	onBlur() {
		this.renderer2.removeClass(this.wrapperElement, 'focused');
	}

	ngOnInit() {
		this.createWrapper();
	}

	private createWrapper() {
		const selectElement = this.elementRef.nativeElement;
		const nextSibling = selectElement.nextSibling;
		const parentElement = selectElement.parentNode;

		const icon = this.createIcon();

		this.renderer2.addClass(selectElement, 'round-2');

		this.renderer2.removeChild(parentElement, selectElement);
		this.renderer2.appendChild(this.wrapperElement, selectElement);
		this.renderer2.appendChild(this.borderBox, icon.location.nativeElement);
		this.renderer2.appendChild(this.wrapperElement, this.borderBox);

		if (null !== nextSibling) {
			this.renderer2.insertBefore(parentElement, this.wrapperElement, nextSibling);
		} else {
			this.renderer2.appendChild(parentElement, this.wrapperElement);
		}
	}

	private createContainer(): HTMLDivElement {
		const container = this.renderer2.createElement('div');

		this.renderer2.addClass(container, 'app-select');

		return container;
	}

	private createBorderBox(): HTMLDivElement {
		const boderBox = this.renderer2.createElement('div');

		this.renderer2.addClass(boderBox, 'border-box');
		this.renderer2.addClass(boderBox, 'flex-row');
		this.renderer2.addClass(boderBox, 'justify-end');
		this.renderer2.addClass(boderBox, 'align-center');

		return boderBox;
	}

	private createIcon(): ComponentRef<SvgComponent> {
		const icon = this.viewContainerRef.createComponent(SvgComponent);

		icon.setInput('icon', 'chevron-down');
		icon.setInput('size', 18);

		return icon;
	}
}
