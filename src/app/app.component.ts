import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { LoadInitialDataUseCase } from 'src/app/use-case/load-initial-data.use-case';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [RouterOutlet, ReactiveFormsModule],
	providers: [LoadInitialDataUseCase],
})
export class AppComponent {
	private readonly loadInitialData = inject(LoadInitialDataUseCase);

	title = 'round-timer';

	readonly loading = this.loadInitialData.execute();
}
