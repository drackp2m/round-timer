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
				path: 'match',
				loadChildren: () => import('./page/match/match.routes'),
			},
			{
				path: 'settings',
				loadChildren: () => import('./page/setting/setting.routes'),
			},
		],
	},
];
