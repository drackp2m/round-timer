import { Routes } from '@angular/router';

export default [
	{
		path: '',
		title: 'Match',
		loadComponent: () => import('./match.page').then(({ MatchPage }) => MatchPage),
	},
	{
		path: 'new',
		title: 'New Match',
		loadComponent: () =>
			import('./page/new/new-match.page').then(({ NewMatchPage }) => NewMatchPage),
	},
] satisfies Routes;
