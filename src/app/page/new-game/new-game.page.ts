import { Component, inject } from '@angular/core';

import { ButtonComponent } from '../../component/button.component';
import { SvgComponent } from '../../component/svg.component';
import { ModalStore } from '../../store/modal.store';
import { ParticipantStore } from '../../store/participant.store';

import { CreateNewParticipantModal } from './modal/create-new-participant/create-new-participant.modal';

@Component({
	templateUrl: './new-game.page.html',
	styleUrl: './new-game.page.scss',
	imports: [ButtonComponent, SvgComponent],
})
export class NewGamePage {
	private readonly participantStore = inject(ParticipantStore);
	private readonly modalStore = inject(ModalStore);

	readonly participants = this.participantStore.participants;
	readonly participantsLoading = this.participantStore.isLoading;

	addParticipant(): void {
		this.modalStore.open(CreateNewParticipantModal);
	}
}
