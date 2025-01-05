import { Routes } from '@angular/router';

export default [
	{
		path: '',
		loadComponent: () => import('./match.page').then(({ MatchPage }) => MatchPage),
	},
] satisfies Routes;
