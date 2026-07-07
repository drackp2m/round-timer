import { Routes } from '@angular/router';

import { backupConflictGuard } from '@app/guard/backup-conflict.guard';

export default [
	{
		path: '',
		title: 'Settings',
		loadComponent: () => import('./setting.page').then(({ SettingPage }) => SettingPage),
	},
	{
		path: 'backup-conflict',
		title: 'Backup conflict',
		canActivate: [backupConflictGuard],
		loadComponent: () =>
			import('./page/backup-conflict/backup-conflict.page').then(
				({ BackupConflictPage }) => BackupConflictPage,
			),
	},
] satisfies Routes;
