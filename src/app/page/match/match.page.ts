import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

import { ShowMillisecondsComponent } from '@app/component/show-milliseconds/show-milliseconds.component';
import { SvgComponent } from '@app/component/svg.component';
import { MatchEventType } from '@app/definition/model/match/match-event-type.enum';
import { MatchButtonsComponent } from '@app/page/match/component/buttons/match-buttons.component';
import { MatchStore } from '@app/store/match.store';
import { PlayerStore } from '@app/store/player.store';

import { ShowMillisecondsPipe } from 'src/app/pipe/show-milliseconds.pipe';
import { Match } from '@app/model/match.model';

@Component({
	templateUrl: './match.page.html',
	styleUrl: './match.page.scss',
	imports: [
		DatePipe,
		MatchButtonsComponent,
		ShowMillisecondsPipe,
		ShowMillisecondsComponent,
		SvgComponent,
	],
})
export class MatchPage {
	private readonly matchStore = inject(MatchStore);
	private readonly playerStore = inject(PlayerStore);

	timer = toSignal(interval(10));

	readonly players = this.playerStore.items;
	readonly playerByUuid = computed(
		() => new Map(this.players()?.map((player) => [player.uuid, player])),
	);

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
		const timerIsRunning = this.timerIsRunning();

		if (timerIsRunning && lastEvent !== undefined) {
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
	readonly fasterTurn = computed(() => {
		const turns = this.matchTurns();

		let index = -1;

		return turns.reduce(
			(acc, turn) => {
				index++;
				if (turn.time < acc.time) {
					return { index, time: turn.time };
				}

				return acc;
			},
			{ index: 0, time: Number.MAX_SAFE_INTEGER },
		);
	});
	readonly slowerTurn = computed(() => {
		const turns = this.matchTurns();

		return turns.toSorted((turn) => -turn.time)[0];
	});

	getPlayerByUuid(uuid: string) {
		return this.players()?.find((player) => player.uuid === uuid);
	}

	dispatch(eventType: MatchEventType): void {
		void this.matchStore.dispatchEvent(eventType);
	}
}
