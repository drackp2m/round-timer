import { Routes } from '@angular/router';

export default [
	{
		path: '',
		loadComponent: () => import('./dashboard.page').then(({ DashboardPage }) => DashboardPage),
	},
] satisfies Routes;
