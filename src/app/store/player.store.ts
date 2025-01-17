import { Injectable, inject } from '@angular/core';
import { patchState, signalStore, type, withState } from '@ngrx/signals';
import { addEntity, entityConfig, setAllEntities, withEntities } from '@ngrx/signals/entities';

import { Player } from '@app/model/player.model';
import { PlayerRepository } from '@app/repository/player.repository';

interface PlayerStoreProps {
	selectedEntities: Record<string, Player>;
	unselectedEntities: Record<string, Player>;
	isLoading: boolean;
}

const initialState: PlayerStoreProps = {
	selectedEntities: {},
	unselectedEntities: {},
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
	add(player: Player): void {
		void this.playerRepository.insert('player', player).then((player) => {
			patchState(this, addEntity(player, playerConfig));
		});
	}

	toggleSelection(entity: Player): void {
		const selectedEntities = { ...this.selectedEntities() };
		let unselectedEntities = { ...this.unselectedEntities() };

		if (entity.uuid in selectedEntities) {
			delete selectedEntities[entity.uuid];
			unselectedEntities = { [entity.uuid]: entity, ...unselectedEntities };
		} else {
			selectedEntities[entity.uuid] = entity;
			delete unselectedEntities[entity.uuid];
		}

		patchState(this, { selectedEntities, unselectedEntities });
	}

	private fetchData(): void {
		patchState(this, { isLoading: true });

		void this.playerRepository.findAll('player').then((items) => {
			items.sort((a, b) => a.updatedAt.getDate() - b.updatedAt.getDate());
			patchState(this, setAllEntities(items, playerConfig));

			patchState(this, { isLoading: false });
		});
	}
}
