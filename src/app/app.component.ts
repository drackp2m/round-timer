import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [RouterOutlet, ReactiveFormsModule],
})
export class AppComponent {
	title = 'round-timer';
}
