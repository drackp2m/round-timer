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
				path: 'new-game',
				loadComponent: () =>
					import('./page/new-game/new-game.page').then(({ NewGamePage }) => NewGamePage),
			},
		],
	},
];
