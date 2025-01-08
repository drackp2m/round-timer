import { Routes } from '@angular/router';

import { MainLayout } from './layout/main/main.layout';

export const APP_ROUTES: Routes = [
	{
		path: '',
		component: MainLayout,
		children: [
			{
				path: '',
				loadChildren: () => import('./page/dashboard/dashboard.routes'),
			},
			{
				path: 'match',
				loadChildren: () => import('./page/match/match.routes'),
			},
			{
				path: 'settings',
				loadChildren: () => import('./page/config/setting.routes'),
			},
		],
	},
];
