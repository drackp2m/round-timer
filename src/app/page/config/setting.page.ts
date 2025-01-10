import { Component, Signal, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Theme } from '@app/definition/theme.type';
import { RadioDirective } from '@app/directive/radio.directive';
import { ThemeService } from '@app/service/theme.service';

@Component({
	templateUrl: './setting.page.html',
	imports: [ReactiveFormsModule, RadioDirective],
})
export class SettingPage {
	private readonly themeService = inject(ThemeService);

	readonly form = new FormGroup({
		appearance: new FormControl<Theme | 'system'>(this.themeService.selectedTheme(), {
			nonNullable: true,
			validators: [Validators.required],
		}),
	});

	private readonly appearanceChange: Signal<Theme | 'system'> = toSignal(
		this.form.controls.appearance.valueChanges,
		{ initialValue: this.themeService.selectedTheme() },
	);

	constructor() {
		effect(() => {
			const newTheme = this.appearanceChange();

			void this.themeService.updateSelectedTheme(newTheme);
		});
	}
}
