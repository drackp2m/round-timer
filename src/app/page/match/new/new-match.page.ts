import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AddPlayerModal } from './modal/add-player/add-player.modal';

import { SvgComponent } from '@app/component/svg.component';
import { ButtonDirective } from '@app/directive/button.directive';
import { InputDirective } from '@app/directive/input.directive';
import { RadioCheckboxDirective } from '@app/directive/radio-checkbox.directive';
import { SelectDirective } from '@app/directive/select/select.directive';
import { MatchPlayer } from '@app/model/match-player.model';
import { Match } from '@app/model/match.model';
import { Player } from '@app/model/player.model';
import { AddGameModal } from '@app/page/match/new/modal/add-game/add-game.modal';
import { GameStore } from '@app/store/game.store';
import { MatchStore } from '@app/store/match.store';
import { ModalStore } from '@app/store/modal.store';
import { PlayerStore } from '@app/store/player.store';

@Component({
	templateUrl: './new-match.page.html',
	imports: [
		InputDirective,
		SelectDirective,
		ButtonDirective,
		SvgComponent,
		ReactiveFormsModule,
		RadioCheckboxDirective,
	],
})
export class NewMatchPage {
	private readonly gameStore = inject(GameStore);
	private readonly playerStore = inject(PlayerStore);
	private readonly matchStore = inject(MatchStore);
	private readonly modalStore = inject(ModalStore);
	private readonly router = inject(Router);

	readonly games = this.gameStore.items;
	readonly gamesStoreIsLoading = this.gameStore.isLoading;

	readonly playersList = computed(() => {
		const players = this.playerStore.playerEntities();
		const selectedPlayers = this.playerStore.selectedEntities();
		const unselectedPlayers = this.playerStore.unselectedEntities();

		return [
			...Object.values(selectedPlayers),
			...Object.values(unselectedPlayers),
			...players.filter(
				(player) => !(player.uuid in selectedPlayers) && !(player.uuid in unselectedPlayers),
			),
		];
	});
	readonly playerStoreIsLoading = this.playerStore.isLoading;

	readonly formPlayersLoaded = signal(false);

	readonly form = new FormGroup({
		name: new FormControl<string>('', {
			nonNullable: true,
			validators: [Validators.required, Validators.minLength(5)],
		}),
		gameUuid: new FormControl<string>('', {
			nonNullable: true,
			validators: [Validators.required],
		}),
		players: new FormGroup<Record<string, FormControl<boolean>>>({}),
	});

	constructor() {
		const fillFormPlayersEffectRef = effect(() => {
			if (this.playerStoreIsLoading()) {
				return;
			}

			fillFormPlayersEffectRef.destroy();

			const players = this.playersList();

			this.fillFormPlayers(players);
			this.formPlayersLoaded.set(true);
		});
	}

	addGame(): void {
		void this.modalStore.open(AddGameModal);
	}

	async addPlayer(): Promise<void> {
		const component = await this.modalStore.open(AddPlayerModal);

		component.instance.onClose$.subscribe((player) => {
			this.form.controls.players.addControl(
				player.uuid,
				new FormControl<boolean>(true, { nonNullable: true }),
			);
			this.playerStore.add(player);
			this.playerStore.toggleSelection(player);
		});
	}

	toggleSelection(event: Event): void {
		const players = this.playersList();
		const target = event.target as HTMLInputElement;
		const playerUuid = target.value;

		const player = players.find((player) => player.uuid === playerUuid);

		if (player !== undefined) {
			this.playerStore.toggleSelection(player);
		}
	}

	async createMatch(): Promise<void> {
		const rawForm = this.form.getRawValue();

		const match = new Match({ gameUuid: rawForm.gameUuid, name: rawForm.name });
		const players = this.getPlayersFromForm(match.uuid);

		await this.matchStore.createMatch(match, players);

		await this.router.navigate(['/match']);
	}

	private fillFormPlayers(players: Player[]): void {
		const playerControls: Record<string, FormControl<boolean>> = {};

		const controls = players.reduce((playerControls, player) => {
			playerControls[player.uuid] = new FormControl<boolean>(false, { nonNullable: true });

			return playerControls;
		}, playerControls);

		this.form.setControl('players', new FormGroup(controls));
	}

	private getPlayersFromForm(matchUuid: string): MatchPlayer[] {
		return this.playersList()
			.filter((player) => true === this.form.controls.players.get(player.uuid)?.value)
			.map(({ uuid: playerUuid }) => new MatchPlayer({ matchUuid, playerUuid }).toObject());
	}
}
