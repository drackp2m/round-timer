import {
	Component,
	ElementRef,
	effect,
	inject,
	linkedSignal,
	signal,
	viewChildren,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SvgComponent } from '@app/component/svg.component';
import { ButtonDirective } from '@app/directive/button.directive';
import { InputDirective } from '@app/directive/input.directive';
import { SelectDirective } from '@app/directive/select.directive';
import { MatchPlayer } from '@app/model/match-player.model';
import { Match } from '@app/model/match.model';
import { Player } from '@app/model/player.model';
import { AddGameModal } from '@app/page/match/new/modal/add-game/add-game.modal';
import { MatchRepository } from '@app/repository/match.repository';
import { GameStore } from '@app/store/game.store';
import { MatchStore } from '@app/store/match.store';
import { ModalStore } from '@app/store/modal.store';
import { PlayerStore } from '@app/store/player.store';

import { AddPlayerModal } from './modal/add-player/add-player.modal';

@Component({
	templateUrl: './new-match.page.html',
	imports: [InputDirective, SelectDirective, ButtonDirective, SvgComponent, ReactiveFormsModule],
})
export class NewMatchPage {
	private readonly gameStore = inject(GameStore);
	private readonly playerStore = inject(PlayerStore);
	private readonly matchStore = inject(MatchStore);
	private readonly modalStore = inject(ModalStore);
	private readonly matchRepository = inject(MatchRepository);
	private readonly router = inject(Router);

	readonly games = this.gameStore.items;
	readonly gamesStoreIsLoading = this.gameStore.isLoading;

	readonly players = linkedSignal(this.playerStore.items);
	readonly playerStoreIsLoading = this.playerStore.isLoading;

	readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('input');

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
			const players = this.players();

			if (null !== players) {
				fillFormPlayersEffectRef.destroy();

				this.fillFormPlayers(players);
				this.formPlayersLoaded.set(true);
			}
		});
	}

	addGame(): void {
		void this.modalStore.open(AddGameModal);
	}

	addPlayer(): void {
		void this.modalStore.open(AddPlayerModal);
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
		return (
			this.players()
				?.filter((player) => this.form.controls.players.get(player.uuid)?.value)
				.map(({ uuid }) => new MatchPlayer({ matchUuid, playerUuid: uuid }).forRepository()) ?? []
		);
	}
}
