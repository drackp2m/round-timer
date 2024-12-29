import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '@app/component/button.component';

@Component({
	selector: 'app-header',
	template: `<section
		class="header p-2 px-4 surface-contrast color-primary flex-row align-center justify-between"
	>
		<button [routerLink]="['/']">
			<h3>Round Timer</h3>
		</button>

		<div class="flex-row gap-2 align-center">
			<app-button icon="user-plus" color="primary-mid" />
			<app-button icon="trash" color="primary-mid" />
			<app-button icon="gear" color="primary-mid" />
		</div>
	</section>`,
	imports: [RouterLink, ButtonComponent],
})
export class HeaderComponent {}
