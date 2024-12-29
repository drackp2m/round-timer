import { Injectable, inject } from '@angular/core';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { Player } from '@app/definition/player/player.model';
import { ParticipantRepository } from '@app/repository/participant.repository';

interface PlayerStoreProps {
	player: Player[] | null;
	isLoading: boolean;
}

const initialState: PlayerStoreProps = {
	player: null,
	isLoading: false,
};

@Injectable({
	providedIn: 'root',
})
export class PlayerStore extends signalStore({ protectedState: false }, withState(initialState)) {
	private readonly playerRepository = inject(ParticipantRepository);

	constructor() {
		super();

		this.fetchParticipants();
	}

	private fetchParticipants(): void {
		patchState(this, { isLoading: true });

		this.playerRepository.getAll('player').then((players) => {
			if (players) {
				patchState(this, { player: players, isLoading: false });
			}
		});
	}
}
