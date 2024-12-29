import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonDirective } from '@app/directive/button.directive';

@Component({
	templateUrl: './dashboard.page.html',
	imports: [RouterLink, ButtonDirective],
})
export class DashboardPage {
	number = signal(22);

	increaseNumber(): void {
		this.number.update((value) => value + 1);
	}
}
