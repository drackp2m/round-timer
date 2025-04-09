import { Component } from '@angular/core';

@Component({
	selector: 'app-select-options',
	template: `<div class="options-container"></div>`,
	styles: [
		`
			:host {
				display: block;
				position: relative;
				bottom: 1.5px;
			}

			.options-container {
				background-color: var(--color-primary);
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
