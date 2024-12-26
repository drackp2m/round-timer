import { Component, inject } from '@angular/core';

import { ButtonComponent } from '../../component/button.component';
import { ParticipantStore } from '../../store/participant.store';
import { SvgComponent } from '../../component/svg.component';
import { ModalService } from '../../service/modal/modal.service';
import { DashboardPage } from '../dashboard/dashboard.page';

@Component({
	templateUrl: './new-game.page.html',
	styleUrl: './new-game.page.scss',
	imports: [ButtonComponent, SvgComponent],
})
export class NewGamePage {
	private readonly participantStore = inject(ParticipantStore);
	private readonly modalService = inject(ModalService);

	readonly participants = this.participantStore.participants;
	readonly participantsLoading = this.participantStore.isLoading;

	addParticipant(): void {
		this.modalService.show(DashboardPage);
	}

	closeModal(): void {
		this.modalService.clear();
	}
}
