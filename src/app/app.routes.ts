import { Routes } from '@angular/router';

import { MainLayout } from './layout/main/main.layout';

export const APP_ROUTES: Routes = [
	{
		path: '',
		component: MainLayout,
		children: [
			{
				path: '',
				loadComponent: () =>
					import('./page/dashboard/dashboard.page').then(({ DashboardPage }) => DashboardPage),
			},
			{
				path: 'new-match',
				loadChildren: () => import('./page/new-match/new-match.routes'),
			},
		],
	},
];
