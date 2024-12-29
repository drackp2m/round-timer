import { Component, inject } from '@angular/core';

import { SvgComponent } from '@app/component/svg.component';
import { ButtonDirective } from '@app/directive/button.directive';
import { ModalStore } from '@app/store/modal.store';
import { PlayerStore } from '@app/store/player.store';

import { CreateNewPlayerModal } from './modal/create-new-player/create-new-player.modal';

@Component({
	templateUrl: './new-game.page.html',
	styleUrl: './new-game.page.scss',
	imports: [ButtonDirective, SvgComponent],
})
export class NewGamePage {
	private readonly playerStore = inject(PlayerStore);
	private readonly modalStore = inject(ModalStore);

	readonly players = this.playerStore.items;
	readonly playerStoreIsLoading = this.playerStore.isLoading;

	addPlayer(): void {
		this.modalStore.open(CreateNewPlayerModal);
	}
}
