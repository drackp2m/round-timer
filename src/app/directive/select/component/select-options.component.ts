import { Component } from '@angular/core';

@Component({
	selector: 'app-select-options',
	template: `<div class="options-container">
		<option value="1">Select an option</option>
		<option value="2">Select an option</option>
		<option value="3">Select an option</option>
	</div>`,
	styles: [
		`
			.options-container {
				background-color: var(--color-primary);
				padding: 7px 11px;
				border: solid 1.5px var(--color-contrast-mid);
				position: absolute;
				width: 100%;
				left: 0;
				top: 0;
			}
		`,
	],
})
export class SelectOptionsComponent {}
