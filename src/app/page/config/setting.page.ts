import { Component, Signal, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Theme } from '@app/definition/service/theme.type';
import { ButtonDirective } from '@app/directive/button.directive';
import { RadioCheckboxDirective } from '@app/directive/radio-checkbox/radio-checkbox.directive';
import { version } from '@app/package';
import { ThemeService } from '@app/service/theme.service';
import { RestoreConflictStore } from '@app/store/restore-conflict.store';
import { BackupDataUseCase } from '@app/use-case/backup-data.use-case';
import { RestoreDataUseCase } from '@app/use-case/restore-data.use-case';

@Component({
	templateUrl: './setting.page.html',
	styleUrl: './setting.page.scss',
	imports: [ReactiveFormsModule, RadioCheckboxDirective, ButtonDirective],
	providers: [BackupDataUseCase, RestoreDataUseCase],
})
export class SettingPage {
	readonly VERSION = version;

	private readonly themeService = inject(ThemeService);
	private readonly router = inject(Router);
	private readonly backupDataUseCase = inject(BackupDataUseCase);
	private readonly restoreDataUseCase = inject(RestoreDataUseCase);
	private readonly restoreConflictStore = inject(RestoreConflictStore);

	readonly restoreSummary = this.restoreConflictStore.summary;
	readonly restoreError = signal<string | null>(null);
	readonly downloadError = signal<string | null>(null);

	readonly restoreSummaryRows = computed(() => {
		const summary = this.restoreSummary();

		if (null === summary) {
			return [];
		}

		return [
			{ label: 'Players', counters: summary.players },
			{ label: 'Games', counters: summary.games },
			{ label: 'Settings', counters: summary.settings },
			{ label: 'Matches', counters: summary.matches },
			{ label: 'Match players', counters: summary.matchPlayers },
			{ label: 'Match events', counters: summary.matchEvents },
		];
	});

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

	async downloadBackup(): Promise<void> {
		this.downloadError.set(null);

		try {
			await this.backupDataUseCase.execute();
		} catch {
			this.downloadError.set('Could not generate the backup file.');
		}
	}

	async restoreBackup(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		input.value = '';

		if (undefined === file) {
			return;
		}

		this.restoreError.set(null);
		this.restoreConflictStore.setSummary(null);

		try {
			const session = await this.restoreDataUseCase.analyze(file);

			if (this.restoreDataUseCase.hasConflicts(session)) {
				await this.router.navigate(['/settings/backup-conflict']);

				return;
			}

			await this.restoreDataUseCase.apply({});
		} catch {
			this.restoreError.set('The selected file is not a valid backup.');
		}
	}
}
