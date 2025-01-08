import { Injectable, Signal, effect, inject } from '@angular/core';
import { Router } from '@angular/router';

import { MatchStore } from '@app/store/match.store';

@Injectable()
export class LoadInitialDataUseCase {
	private readonly matchStore = inject(MatchStore);
	private readonly router = inject(Router);

	execute(): Signal<boolean> {
		this.redirectToMatchIfMatchIsInProgress();

		return this.matchStore.isLoading;
	}

	private redirectToMatchIfMatchIsInProgress(): void {
		const findInProgressMatchEffectRef = effect(() => {
			const isLoading = this.matchStore.isLoading();
			const match = this.matchStore.match();

			if (!isLoading && null !== match) {
				findInProgressMatchEffectRef.destroy();

				// ToDo => change this to match page
				void this.router.navigate(['/new-match']);
			}
		});
	}
}
