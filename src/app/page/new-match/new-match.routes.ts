import { Routes } from '@angular/router';

export default [
	{
		path: '',
		loadComponent: () => import('./new-match.page').then(({ NewMatchPage }) => NewMatchPage),
	},
] satisfies Routes;
