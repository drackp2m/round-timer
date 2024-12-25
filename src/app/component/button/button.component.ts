import { Component } from '@angular/core';

@Component({
	selector: 'app-button',
	template: `<button class="surface-accent color-primary p-xs px-sm round-md">
		<ng-content />
	</button>`,
	styles: [``],
})
export class ButtonComponent {}
