import { Injectable, inject } from '@angular/core';
import { patchState, signalStore, type, withState } from '@ngrx/signals';
import { entityConfig, withEntities } from '@ngrx/signals/entities';

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

const playerConfig = entityConfig({
	entity: type<Player>(),
	collection: 'player',
	selectId: (player) => player.uuid,
});

@Injectable({
	providedIn: 'root',
})
export class PlayerStore extends signalStore(
	{ protectedState: false },
	withState(initialState),
	withEntities(playerConfig),
) {
	private readonly playerRepository = inject(PlayerRepository);

	constructor() {
		super();

		this.fetchData();
	}

	// FixMe => sort elements according to checkboxes
	// FixMe => remove model data thats not present in the schema (schema maybe should use a different model)
	addPlayer(player: Player): void {
		void this.playerRepository.insert('player', player).then((player) => {
			const currentItems = this.items();

			patchState(this, { items: [...(currentItems ?? []), player] });
		});
	}

	private fetchData(): void {
		patchState(this, { isLoading: true });

		void this.playerRepository.findAll('player').then((items) => {
			patchState(this, { items, isLoading: false });
		});
	}
}
