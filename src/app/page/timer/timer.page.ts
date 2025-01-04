import { DatePipe, JsonPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

import { SvgComponent } from '@app/component/svg.component';
import { MatchEventType, MatchEventTypeKey } from '@app/definition/match/match-event-type.enum';
import { MatchStore } from '@app/store/match.store';
import { PlayerStore } from '@app/store/player.store';

import { ElapsedTimePipe } from 'src/app/pipe/elapsed-time.pipe';

@Component({
	templateUrl: './timer.page.html',
	styleUrl: './timer.page.scss',
	imports: [SvgComponent, DatePipe, JsonPipe, ElapsedTimePipe],
})
export class TimerPage {
	private readonly matchStore = inject(MatchStore);
	private readonly playerStore = inject(PlayerStore);

	timer = toSignal(interval(10));

	readonly players = this.playerStore.items;

	readonly match = this.matchStore.match;
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
		const currentTurn = this.currentTurn();
		const timerIsRunning = this.timerIsRunning();

		if (timerIsRunning && currentTurn !== undefined && lastEvent !== undefined) {
			const lastEventCreatedAt = new Date(lastEvent.createdAt);

			return currentTurn.time + Date.now() - lastEventCreatedAt.getTime();
		}

		return 0;
	});
	readonly round = this.matchStore.round;
	readonly turn = this.matchStore.turn;
	readonly playersOrder = computed(() =>
		this.matchStore
			.currentPlayersOrder()
			.map((uuid) => this.playerStore.items()?.find((player) => player.uuid === uuid))
			.filter((player) => player !== undefined),
	);
	readonly currentPlayer = computed(() =>
		this.players()?.find((player) => player.uuid === this.matchStore.currentPlayer()),
	);

	dispatch(eventType: MatchEventTypeKey): void {
		const type = MatchEventType[eventType];

		void this.matchStore.dispatchEvent<typeof type>(eventType);
	}

	togglePlayPauseEvent(): void {
		const timerIsRunning = this.timerIsRunning();

		if (timerIsRunning) {
			this.dispatch('PAUSE');
		} else {
			this.dispatch('RESUME');
		}
	}
}
