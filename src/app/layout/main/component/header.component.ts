import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../../component/button.component';

@Component({
	selector: 'app-header',
	template: `<section
		class="header p-sm px-md surface-contrast color-primary flex-row align-center justify-between"
	>
		<button [routerLink]="['/']">
			<h3>Round Timer</h3>
		</button>

		<div class="flex-row gap-sm align-center">
			<app-button icon="user-plus" color="primary-mid" />
			<app-button icon="trash" color="primary-mid" />
			<app-button icon="gear" color="primary-mid" />
		</div>
	</section>`,
	imports: [RouterLink, ButtonComponent],
})
export class HeaderComponent {}
