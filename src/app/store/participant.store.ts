import { Injectable, inject } from '@angular/core';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { Participant } from '../definition/participant/participant.model';
import { ParticipantRepository } from '../repository/participant.repository';

interface ParticipantsStoreProps {
	participants: Participant[] | null;
	isLoading: boolean;
}

const initialState: ParticipantsStoreProps = {
	participants: null,
	isLoading: false,
};

@Injectable({
	providedIn: 'root',
})
export class ParticipantStore extends signalStore(
	{ protectedState: false },
	withState(initialState),
) {
	private readonly participantRepository = inject(ParticipantRepository);

	constructor() {
		super();

		this.fetchParticipants();
	}

	private fetchParticipants(): void {
		patchState(this, { isLoading: true });

		this.participantRepository.getAll('participant').then((participants) => {
			if (participants) {
				patchState(this, { participants, isLoading: false });
			}
		});
	}
}
