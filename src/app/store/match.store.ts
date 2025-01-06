import { Injectable, computed, inject } from '@angular/core';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { MatchEventType } from '@app/definition/model/match/match-event-type.enum';
import { MatchEventPayload } from '@app/definition/model/match/match-event-type.type';
import { MatchEvent } from '@app/model/match-event.model';
import { MatchPlayer } from '@app/model/match-player.model';
import { Match } from '@app/model/match.model';
import { MatchRepository } from '@app/repository/match.repository';
import { Enum } from '@app/util/enum';

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
	private readonly calculateMatchTurns = inject(CalculateMatchTurns);

	readonly matchTurns = computed(() => {
		const events = this.events() ?? [];

		return this.calculateMatchTurns.execute(events);
	});

	readonly turn = computed(() => (0 !== this.matchTurns().length ? this.matchTurns().length : 1));
	readonly round = computed(() => {
		const turn = this.turn();
		const playersCount = this.playerUuids()?.length ?? 0;

		return Math.floor((turn - 1) / playersCount) + 1;
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

		return playersOrder?.at((turn - 1) % 3);
	});

	constructor() {
		super();

		this.fetchDataAsync();
	}

	async dispatchEvent<T extends MatchEventType = MatchEventType>(
		type: MatchEventType,
		payload?: MatchEventPayload[T],
	): Promise<void> {
		const match = this.match();
		const events = this.events() ?? [];
		const typeKey = Enum.getEnumKeyByValue(MatchEventType, type);

		if (null === match) {
			return;
		}

		const event = new MatchEvent({ matchUuid: match.uuid, type: typeKey, payload });

		// await this.matchRepository.insert('match_event', event.forRepository());

		patchState(this, { events: [...events, event] });
	}

	async createMatch(match: Match, matchPlayers: MatchPlayer[]): Promise<void> {
		const playerUuids = matchPlayers.map(({ playerUuid }) => playerUuid);

		const matchEvent = new MatchEvent<MatchEventType.SET_TURN_ORDER>({
			matchUuid: match.uuid,
			type: 'SET_TURN_ORDER',
			payload: playerUuids,
		});

		await this.matchRepository.beginTransaction(['match', 'match_player', 'match_event']);
		await this.matchRepository.insert('match', match.forRepository());
		await this.matchRepository.batchInsert('match_player', matchPlayers);
		await this.matchRepository.insert('match_event', matchEvent.forRepository());
		await this.matchRepository.commitTransaction();

		patchState(this, { match, playerUuids, events: [matchEvent] });
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
