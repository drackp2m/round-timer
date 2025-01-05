import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonDirective } from '@app/directive/button.directive';

@Component({
	selector: 'app-header',
	template: `<section
		class="header p-2 px-4 surface-contrast color-primary flex-row align-center justify-between"
	>
		<button routerLink="/">
			<h3>Round Timer</h3>
		</button>

		<div class="flex-row gap-2 align-center">
			<button appButton icon="user-plus" color="primary-mid">
				<!---->
			</button>
			<button appButton icon="trash" color="primary-mid">
				<!---->
			</button>
			<button appButton icon="gear" color="primary-mid">
				<!---->
			</button>
		</div>
	</section>`,
	imports: [RouterLink, ButtonDirective],
})
export class HeaderComponent {}
