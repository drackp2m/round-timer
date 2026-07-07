import { Routes } from '@angular/router';

export default [
	{
		path: '',
		title: 'Settings',
		loadComponent: () => import('./setting.page').then(({ SettingPage }) => SettingPage),
	},
	{
		path: 'backup-conflict',
		title: 'Backup conflict',
		loadComponent: () =>
			import('./page/backup-conflict/backup-conflict.page').then(
				({ BackupConflictPage }) => BackupConflictPage,
			),
	},
] satisfies Routes;
