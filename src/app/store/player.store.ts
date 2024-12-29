import { Injectable, inject } from '@angular/core';
import { Player } from '@app/model/player.model';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { PlayerRepository } from '@app/repository/player.repository';

interface PlayerStoreProps {
	items: Player[] | null;
	isLoading: boolean;
}

const initialState: PlayerStoreProps = {
	items: null,
	isLoading: false,
};

@Injectable({
	providedIn: 'root',
})
export class PlayerStore extends signalStore({ protectedState: false }, withState(initialState)) {
	private readonly playerRepository = inject(PlayerRepository);

	constructor() {
		super();

		this.fetchData();
	}

	addPlayer(player: Player): void {
		this.playerRepository.set('player', player.uuid, player).then((player) => {
			const currentItems = this.items();
			console.log('Player added', player);

			patchState(this, { items: [...(currentItems ?? []), player] });
		});
	}

	private fetchData(): void {
		patchState(this, { isLoading: true });

		this.playerRepository.getAll('player').then((items) => {
			if (items) {
				patchState(this, { items, isLoading: false });
			}
		});
	}
}
