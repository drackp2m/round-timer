import { Component, Signal, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Theme } from '@app/definition/service/theme.type';
import { RadioCheckboxDirective } from '@app/directive/radio-checkbox.directive';
import { version } from '@app/package';
import { ThemeService } from '@app/service/theme.service';

@Component({
	templateUrl: './setting.page.html',
	styleUrl: './setting.page.scss',
	imports: [ReactiveFormsModule, RadioCheckboxDirective],
})
export class SettingPage {
	readonly VERSION = version;

	private readonly themeService = inject(ThemeService);

	private firstChangeIgnored = false;

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

			if (this.firstChangeIgnored) {
				this.themeService.updateSelectedTheme(newTheme);
			} else {
				this.firstChangeIgnored = true;
			}
		});
	}
}
