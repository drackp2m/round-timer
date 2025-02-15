import { Injectable, computed, inject } from '@angular/core';
import { patchState, signalStore, withState } from '@ngrx/signals';
import { StoreNames } from 'idb';

import { MatchEventType } from '@app/definition/model/match/match-event-type.enum';
import { MatchEventPayload } from '@app/definition/model/match/match-event-type.type';
import { MatchEvent } from '@app/model/match-event.model';
import { MatchPlayer } from '@app/model/match-player.model';
import { Match } from '@app/model/match.model';
import { MatchSchema } from '@app/repository/definition/match-schema.interface';
import { GameRepository } from '@app/repository/game.repository';
import { MatchRepository } from '@app/repository/match.repository';
import { CalculateMatchTurns } from '@app/use-case/match/calculate-match-turns.use-case';
import { Enum } from '@app/util/enum';

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
	private readonly gameRepository = inject(GameRepository);
	private readonly calculateMatchTurns = new CalculateMatchTurns();

	readonly matchTurns = computed(() => {
		const events = this.events() ?? [];

		const lastEvent = events[events.length - 1];

		if (lastEvent === undefined) {
			return [];
		}

		return this.calculateMatchTurns.addEvent(lastEvent);
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

		return playersOrder.at((turn - 1) % playersOrder.length);
	});

	constructor() {
		super();

		this.fetchDataAsync();
	}

	async dispatchEvent(
		type: MatchEventType,
		payload?: MatchEventPayload[MatchEventType],
	): Promise<void> {
		const match = this.match();
		const events = this.events() ?? [];
		const typeKey = Enum.getEnumKeyByValue(MatchEventType, type);

		if (null === match) {
			return;
		}

		const event = new MatchEvent({ matchUuid: match.uuid, type: typeKey, payload });

		await this.matchRepository.insert('match_event', event.toObject());

		patchState(this, { events: [...events, event] });
	}

	async createMatch(match: Match, matchPlayers: MatchPlayer[]): Promise<void> {
		const playerUuids = matchPlayers.map(({ playerUuid }) => playerUuid);
		const game = await this.gameRepository.find('game', match.gameUuid);

		const eachRoundDifferentTurnOrder = 'EACH_ROUND_DIFFERENT' === game?.turnOrder;
		const matchEvent = eachRoundDifferentTurnOrder
			? undefined
			: new MatchEvent<MatchEventType.SET_TURN_ORDER>({
					matchUuid: match.uuid,
					type: 'SET_TURN_ORDER',
					payload: playerUuids,
				});
		const repositories: StoreNames<MatchSchema>[] =
			matchEvent === undefined
				? ['match', 'match_player']
				: ['match', 'match_player', 'match_event'];
		await this.matchRepository.beginTransaction(repositories);
		await this.matchRepository.insert('match', match.toObject());
		await this.matchRepository.batchInsert('match_player', matchPlayers);
		if (matchEvent !== undefined) {
			await this.matchRepository.insert('match_event', matchEvent.toObject());
		}
		await this.matchRepository.commitTransaction();

		patchState(this, { match, playerUuids, events: matchEvent !== undefined ? [matchEvent] : [] });
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

		matchEvents.forEach((event, index) => {
			if (index !== matchEvents.length - 1) {
				this.calculateMatchTurns.addEvent(event);
			}
		});

		patchState(this, { match, playerUuids: players, events: matchEvents, isLoading: false });
	}
}
