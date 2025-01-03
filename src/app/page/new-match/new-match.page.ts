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

import { SvgComponent } from '@app/component/svg.component';
import { ButtonDirective } from '@app/directive/button.directive';
import { InputDirective } from '@app/directive/input.directive';
import { SelectDirective } from '@app/directive/select.directive';
import { MatchPlayer } from '@app/model/match-participant.model';
import { Match } from '@app/model/match.model';
import { Player } from '@app/model/player.model';
import { AddGameModal } from '@app/page/new-match/modal/add-game/add-game.modal';
import { MatchRepository } from '@app/repository/match.repository';
import { GameStore } from '@app/store/game.store';
import { ModalStore } from '@app/store/modal.store';
import { PlayerStore } from '@app/store/player.store';

import { AddPlayerModal } from './modal/add-player/add-player.modal';

@Component({
	templateUrl: './new-match.page.html',
	styleUrl: './new-match.page.scss',
	imports: [InputDirective, SelectDirective, ButtonDirective, SvgComponent, ReactiveFormsModule],
})
export class NewMatchPage {
	private readonly gameStore = inject(GameStore);
	private readonly playerStore = inject(PlayerStore);
	private readonly modalStore = inject(ModalStore);
	private readonly matchRepository = inject(MatchRepository);

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

	createMatch(): void {
		const match = new Match(this.form.getRawValue());

		this.matchRepository.beginTransaction(['match', 'match_player']);

		this.matchRepository.insert('match', match.forRepository()).then(() => {
			const matchPlayers = Object.entries(this.form.getRawValue().players)
				.filter(([, value]) => value)
				.map(([playerUuid]) => {
					const matchPlayer = new MatchPlayer({
						matchUuid: match.uuid,
						playerUuid,
					});

					return this.matchRepository.insert('match_player', matchPlayer.forRepository());
				});

			Promise.all(matchPlayers).then(() => {
				this.matchRepository.commitTransaction();
			});
		});
	}

	private fillFormPlayers(players: Player[]): void {
		const playerControls: Record<string, FormControl<boolean>> = {};

		const controls = players.reduce((playerControls, player) => {
			playerControls[player.uuid] = new FormControl<boolean>(false, { nonNullable: true });

			return playerControls;
		}, playerControls);

		this.form.setControl('players', new FormGroup(controls));
	}
}
