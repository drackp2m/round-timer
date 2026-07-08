import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { RestoreChoice, RestoreResolutions } from '@app/definition/use-case/restore.interface';
import { ButtonDirective } from '@app/directive/button.directive';
import { RadioCheckboxDirective } from '@app/directive/radio-checkbox/radio-checkbox.directive';
import { ShortenUuidPipe } from '@app/pipe/shorten-uuid.pipe';
import { RestoreConflictStore } from '@app/store/restore-conflict.store';
import { RestoreDataUseCase } from '@app/use-case/restore-data.use-case';

@Component({
	templateUrl: './backup-conflict.page.html',
	styleUrl: './backup-conflict.page.scss',
	imports: [RadioCheckboxDirective, ButtonDirective, ShortenUuidPipe, DatePipe],
	providers: [RestoreDataUseCase],
})
export class BackupConflictPage {
	private readonly router = inject(Router);
	private readonly restoreDataUseCase = inject(RestoreDataUseCase);
	private readonly restoreConflictStore = inject(RestoreConflictStore);

	readonly playerConflicts = computed(
		() => this.restoreConflictStore.session()?.players.conflicts ?? [],
	);

	readonly gameConflicts = computed(
		() => this.restoreConflictStore.session()?.games.conflicts ?? [],
	);

	private readonly resolutions = signal<RestoreResolutions>({});

	resolve(existingUuid: string, choice: RestoreChoice): void {
		this.resolutions.update((current) => ({ ...current, [existingUuid]: choice }));
	}

	async apply(): Promise<void> {
		await this.restoreDataUseCase.apply(this.resolutions());
		await this.router.navigate(['/settings']);
	}

	async cancel(): Promise<void> {
		this.restoreConflictStore.setSession(null);
		await this.router.navigate(['/settings']);
	}
}
