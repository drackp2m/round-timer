import { Routes } from '@angular/router';

export default [
	{
		path: '',
		loadComponent: () => import('./timer.page').then(({ TimerPage }) => TimerPage),
	},
] satisfies Routes;
