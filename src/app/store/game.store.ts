import { Injectable, inject } from '@angular/core';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { Game } from '@app/model/game.model';
import { GameRepository } from '@app/repository/game.repository';

interface GameStoreProps {
	items: Game[] | null;
	isLoading: boolean;
}

const initialState: GameStoreProps = {
	items: null,
	isLoading: false,
};

@Injectable({
	providedIn: 'root',
})
export class GameStore extends signalStore({ protectedState: false }, withState(initialState)) {
	private readonly gameRepository = inject(GameRepository);

	constructor() {
		super();

		this.fetchData();
	}

	addGame(game: Game): void {
		this.gameRepository.set('game', game.uuid, game).then((game) => {
			const currentItems = this.items();

			patchState(this, { items: [...(currentItems ?? []), game] });
		});
	}

	private fetchData(): void {
		patchState(this, { isLoading: true });

		this.gameRepository.getAll('game').then((items) => {
			patchState(this, { items, isLoading: false });
		});
	}
}
