import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../component/button.component';

@Component({
	templateUrl: './dashboard.page.html',
	styleUrl: './dashboard.page.scss',
	imports: [ButtonComponent, RouterLink],
})
export class DashboardPage {
	number = signal(22);

	increaseNumber(): void {
		this.number.update((value) => value + 1);
	}
}
