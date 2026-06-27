import { Component, ElementRef, inject } from '@angular/core';

@Component({
	selector: 'app-select-options',
	template: `<div class="options-container"></div>`,
})
export class SelectOptionsComponent {
	private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
	readonly optionsContainer =
		this.elementRef.nativeElement.querySelector<HTMLDivElement>('.options-container');
}
