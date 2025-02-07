import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

import { ShowMillisecondsComponent } from '@app/component/show-milliseconds/show-milliseconds.component';
import { MatchEventType } from '@app/definition/model/match/match-event-type.enum';
import { MatchButtonsComponent } from '@app/page/match/component/buttons/match-buttons.component';
import { MatchTurnsComponent } from '@app/page/match/component/turns/match-turns.component';
import { GameStore } from '@app/store/game.store';
import { MatchStore } from '@app/store/match.store';
import { PlayerStore } from '@app/store/player.store';

@Component({
	templateUrl: './match.page.html',
	styleUrl: './match.page.scss',
	imports: [DatePipe, MatchButtonsComponent, ShowMillisecondsComponent, MatchTurnsComponent],
})
export class MatchPage {
	private readonly matchStore = inject(MatchStore);
	private readonly gameStore = inject(GameStore);
	private readonly playerStore = inject(PlayerStore);

	timer = toSignal(interval(10));

	readonly players = this.playerStore.playerEntities;

	readonly match = this.matchStore.match;
	readonly game = computed(() =>
		this.gameStore.items()?.find((game) => game.uuid === this.match()?.gameUuid),
	);
	readonly events = this.matchStore.events;
	readonly lastEvent = computed(() => {
		const events = this.events();

		if (null === events) {
			return undefined;
		}

		return events[events.length - 1];
	});
	readonly matchTurns = this.matchStore.matchTurns;
	readonly currentTurn = computed(() => this.matchTurns()[this.matchTurns().length - 1]);
	readonly timerIsRunning = this.matchStore.timerIsRunning;
	readonly currentTimeRunning = computed(() => {
		this.timer();
		const lastEvent = this.lastEvent();
		const timerIsRunning = this.timerIsRunning();

		if (timerIsRunning && lastEvent !== undefined) {
			const lastEventCreatedAt = new Date(lastEvent.createdAt);

			return Date.now() - lastEventCreatedAt.getTime();
		}

		return 0;
	});
	readonly round = this.matchStore.round;
	readonly matchTurn = this.matchStore.turn;
	readonly roundTurn = computed(() => ((this.matchTurn() - 1) % this.playersOrder().length) + 1);
	readonly playersOrder = computed(() =>
		this.matchStore
			.currentPlayersOrder()
			.map((uuid) => this.players().find((player) => player.uuid === uuid))
			.filter((player) => player !== undefined),
	);
	readonly currentPlayer = computed(() =>
		this.players().find((player) => player.uuid === this.matchStore.currentPlayer()),
	);
	readonly fasterTurn = computed(() =>
		this.matchTurns().reduce(
			(acc, turn, index) => (turn.time < acc.time ? { index, time: turn.time } : acc),
			{ index: 0, time: Number.MAX_SAFE_INTEGER },
		),
	);
	readonly slowerTurn = computed(() =>
		this.matchTurns().reduce(
			(acc, turn, index) => (turn.time > acc.time ? { index, time: turn.time } : acc),
			{ index: 0, time: 0 },
		),
	);

	dispatch(eventType: MatchEventType): void {
		console.log(eventType);
		// void this.matchStore.dispatchEvent(eventType);
	}
}
