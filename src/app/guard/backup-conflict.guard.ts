import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { RestoreConflictStore } from '@app/store/restore-conflict.store';

/** Keeps the conflict page reachable only while a restore session is pending. */
export const backupConflictGuard: CanActivateFn = () => {
	const restoreConflictStore = inject(RestoreConflictStore);
	const router = inject(Router);

	if (null === restoreConflictStore.session()) {
		void router.navigate(['/settings']);

		return false;
	}

	return true;
};
