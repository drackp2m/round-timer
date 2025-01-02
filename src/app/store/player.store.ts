import { Injectable, inject } from '@angular/core';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { Player } from '@app/model/player.model';
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
		// FixMe => sort elements according to checkboxes
		// FixMe => remove model data thats not present in the schema (schema maybe should use a different model)
		this.playerRepository.insert('player', player).then((player) => {
			const currentItems = this.items();

			patchState(this, { items: [...(currentItems ?? []), player] });
		});
	}

	private fetchData(): void {
		patchState(this, { isLoading: true });

		this.playerRepository.findAll('player').then((items) => {
			patchState(this, { items, isLoading: false });
		});
	}
}
