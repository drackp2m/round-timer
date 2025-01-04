import { Injectable, computed, inject } from '@angular/core';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { MatchEventType } from '@app/definition/match/match-event-type.enum';
import {
	MatchEventPayload,
	MatchEventType as MatchEventTypeType,
} from '@app/definition/match/match-event-type.type';
import { MatchEvent } from '@app/model/match-event.model';
import { Match } from '@app/model/match.model';
import { MatchRepository } from '@app/repository/match.repository';
import { PlayerStore } from '@app/store/player.store';

import { CalculateMatchTurns } from 'src/app/use-case/match/calculate-match-turns.use-case';

interface MatchStoreProps {
	match: Match | null;
	playerUuids: string[] | null;
	events: MatchEvent[] | null;
	isLoading: boolean;
}

const initialState: MatchStoreProps = {
	match: null,
	playerUuids: null,
	events: null,
	isLoading: false,
};

@Injectable({
	providedIn: 'root',
})
export class MatchStore extends signalStore({ protectedState: false }, withState(initialState)) {
	private readonly matchRepository = inject(MatchRepository);
	private readonly playerStore = inject(PlayerStore);
	private readonly calculateMatchTurns = inject(CalculateMatchTurns);

	// readonly players = computed(() => {
	// 	const players = this.playerStore.items();
	// 	const matchPlayers = this.events()?.find((event) => 'SET_TURN_ORDER' === event.type)?.payload;

	// 	return players?.filter((player) => matchPlayers?.includes(player.uuid));
	// });

	readonly round = computed(() => {
		const events = this.events() ?? [];
		const playersCount = this.playerUuids()?.length ?? 0;

		const nextTurnEventsCount = events.filter((event) => 'NEXT_TURN' === event.type).length;

		return Math.floor(nextTurnEventsCount % playersCount) + 1;
	});

	readonly turn = computed(() => {
		const events = this.events() ?? [];

		const nextTurnEventsCount = events.filter((event) => 'NEXT_TURN' === event.type).length;
		const previousTurnEventsCount = events.filter((event) => 'PREVIOUS_TURN' === event.type).length;

		return nextTurnEventsCount - previousTurnEventsCount;
	});

	readonly timerIsRunning = computed(() => {
		const events = this.events() ?? [];

		const haveNextTurnEvent = events.some((event) => 'NEXT_TURN' === event.type);
		const lastEventIsPause = 'PAUSE' === events[events.length - 1]?.type;

		return haveNextTurnEvent && !lastEventIsPause;
	});

	readonly currentPlayersOrder = computed(() => {
		const events = this.events() ?? [];

		const order = events.findLast((event) => 'SET_TURN_ORDER' === event.type)?.payload;

		return order ?? [];
	});

	readonly currentPlayer = computed(() => {
		const playersOrder = this.currentPlayersOrder();
		const turn = this.turn();

		return playersOrder?.at(turn - 1);
	});

	readonly matchTurns = computed(() => {
		const events = this.events() ?? [];

		return this.calculateMatchTurns.execute(events);
	});

	constructor() {
		super();

		this.fetchDataAsync();
	}

	async dispatchEvent<T extends MatchEventType = MatchEventType>(
		type: MatchEventTypeType[T],
		payload?: MatchEventPayload[T],
	): Promise<void> {
		const match = this.match();
		const events = this.events() ?? [];

		if (null === match) {
			return;
		}

		const event = new MatchEvent({ matchUuid: match.uuid, type: type, payload });

		await this.matchRepository.insert('match_event', event.forRepository());

		patchState(this, { events: [...events, event] });
	}

	private fetchDataAsync(): void {
		void this.fetchData();
	}

	private async fetchData(): Promise<void> {
		patchState(this, { isLoading: true });

		const inProgressMatch = await this.matchRepository.findInProgressMatch();

		if (undefined === inProgressMatch) {
			patchState(this, { isLoading: false });

			return;
		}

		const { match, matchEvents } = inProgressMatch;

		const players = matchEvents.find((event) => 'SET_TURN_ORDER' === event.type)?.payload;

		patchState(this, { match, playerUuids: players, events: matchEvents, isLoading: false });
	}
}
