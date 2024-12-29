import { Component, inject } from '@angular/core';

import { ButtonComponent } from '@app/component/button.component';
import { SvgComponent } from '@app/component/svg.component';
import { ModalStore } from '@app/store/modal.store';
import { PlayerStore } from '@app/store/player.store';

import { CreateNewPlayerModal } from './modal/create-new-player/create-new-player.modal';

@Component({
	templateUrl: './new-game.page.html',
	styleUrl: './new-game.page.scss',
	imports: [ButtonComponent, SvgComponent],
})
export class NewGamePage {
	private readonly playerStore = inject(PlayerStore);
	private readonly modalStore = inject(ModalStore);

	readonly players = this.playerStore.player;
	readonly playerStoreIsLoading = this.playerStore.isLoading;

	addPlayer(): void {
		this.modalStore.open(CreateNewPlayerModal);
	}
}
