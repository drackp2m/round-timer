import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

import { SvgComponent } from '@app/component/svg.component';
import { MatchEventType, MatchEventTypeKey } from '@app/definition/match/match-event-type.enum';
import { MatchStore } from '@app/store/match.store';
import { PlayerStore } from '@app/store/player.store';

import { ElapsedTimePipe } from 'src/app/pipe/elapsed-time.pipe';

@Component({
	templateUrl: './match.page.html',
	styleUrl: './match.page.scss',
	imports: [SvgComponent, DatePipe, ElapsedTimePipe],
})
export class MatchPage {
	private readonly matchStore = inject(MatchStore);
	private readonly playerStore = inject(PlayerStore);

	timer = toSignal(interval(10));

	readonly players = this.playerStore.items;
	readonly playerByUuid = computed(() => {
		const playerMap = new Map(this.players()?.map((player) => [player.uuid, player]));

		return (uuid: string) => playerMap.get(uuid);
	});

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

			return Date.now() - lastEventCreatedAt.getTime();
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

	getPlayerByUuid(uuid: string) {
		return this.players()?.find((player) => player.uuid === uuid);
	}

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
