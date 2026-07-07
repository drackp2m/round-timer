import { Injectable } from '@angular/core';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { RestoreSession, RestoreSummary } from '@app/definition/use-case/restore.interface';

interface RestoreConflictStoreProps {
	session: RestoreSession | null;
	summary: RestoreSummary | null;
}

const initialState: RestoreConflictStoreProps = {
	session: null,
	summary: null,
};

@Injectable({
	providedIn: 'root',
})
export class RestoreConflictStore extends signalStore(
	{ protectedState: false },
	withState(initialState),
) {
	setSession(session: RestoreSession | null): void {
		patchState(this, { session });
	}

	setSummary(summary: RestoreSummary | null): void {
		patchState(this, { summary });
	}
}
