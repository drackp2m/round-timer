import { Component, ElementRef, effect, inject, linkedSignal, viewChildren } from '@angular/core';

import { SvgComponent } from '@app/component/svg.component';
import { ButtonDirective } from '@app/directive/button.directive';
import { SelectDirective } from '@app/directive/select.directive';
import { AddGameModal } from '@app/page/new-match/modal/add-game/add-game.modal';
import { GameStore } from '@app/store/game.store';
import { ModalStore } from '@app/store/modal.store';
import { PlayerStore } from '@app/store/player.store';

import { AddPlayerModal } from './modal/add-player/add-player.modal';

@Component({
	templateUrl: './new-match.page.html',
	styleUrl: './new-match.page.scss',
	imports: [ButtonDirective, SvgComponent, SelectDirective],
})
export class NewMatchPage {
	private readonly gameStore = inject(GameStore);
	private readonly playerStore = inject(PlayerStore);
	private readonly modalStore = inject(ModalStore);

	readonly games = this.gameStore.items;
	readonly gamesStoreIsLoading = this.gameStore.isLoading;

	readonly players = linkedSignal(this.playerStore.items);
	readonly playerStoreIsLoading = this.playerStore.isLoading;

	readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('input');

	// constructor() {
	// 	effect(() => {
	// 		// console.log(this.games());
	// 	});
	// }

	addGame(): void {
		this.modalStore.open(AddGameModal);
	}

	addPlayer(): void {
		this.modalStore.open(AddPlayerModal);
	}

	sortPlayers(event: Event): void {
		const target = event.target as HTMLInputElement;
		const playerUuid = target.value;
		const checked = target.checked;

		const checkedElements = this.inputs().filter((input) => input.nativeElement.checked).length;

		this.players.update((originalPlayers) => {
			const players = [...(originalPlayers ?? [])];

			const playerIndex = players.findIndex((player) => player.uuid === playerUuid);
			const [removePlayer] = players.splice(playerIndex, 1);

			if (removePlayer === undefined) {
				return null;
			}

			if (checked) {
				players.splice(checkedElements - 1, 0, removePlayer);
			} else {
				players.splice(checkedElements, 0, removePlayer);
			}

			return players;
		});
	}
}
