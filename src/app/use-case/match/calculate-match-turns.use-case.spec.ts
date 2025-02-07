<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

=======
import { CalculateMatchTurns } from './calculate-match-turns.use-case';

import { MatchEventTypeKey } from '@app/definition/model/match/match-event-type.enum';
>>>>>>> Stashed changes
import { MatchEvent } from '@app/model/match-event.model';

=======
import { CalculateMatchTurns } from './calculate-match-turns.use-case';

import { MatchEventTypeKey } from '@app/definition/model/match/match-event-type.enum';
import { MatchEvent } from '@app/model/match-event.model';

>>>>>>> Stashed changes
describe('CalculateMatchTurns', () => {
	let service: CalculateMatchTurns;
	const MATCH_UUID = 'test-match-uuid';
	let currentUuid = 0;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideExperimentalZonelessChangeDetection(), CalculateMatchTurns],
		});
		service = TestBed.inject(CalculateMatchTurns);

		Object.defineProperty(global.crypto, 'randomUUID', {
			value: () => `test-uuid-${++currentUuid}`,
			configurable: true,
		});

		jest.useFakeTimers();
		jest.setSystemTime(new Date('2025-01-29T11:16:38Z'));
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should calculate turns with SET_TURN_ORDER and NEXT_TURN events', () => {
		const event1 = new MatchEvent({
			type: 'SET_TURN_ORDER',
			payload: ['player1', 'player2'],
			matchUuid: MATCH_UUID,
		});

		jest.advanceTimersByTime(1000);

		const event2 = new MatchEvent({
			type: 'NEXT_TURN',
			payload: undefined,
			matchUuid: MATCH_UUID,
		});

		jest.advanceTimersByTime(2000);

		const event3 = new MatchEvent({
			type: 'NEXT_TURN',
			payload: undefined,
			matchUuid: MATCH_UUID,
		});

		jest.advanceTimersByTime(5000);

		const event4 = new MatchEvent({
			type: 'PAUSE',
			payload: undefined,
			matchUuid: MATCH_UUID,
		});

		const result = service.execute([event1, event2, event3, event4]);

		expect(result).toEqual([
			{ playerUuid: 'player1', time: 2000 },
			{ playerUuid: 'player2', time: 5000 },
		]);
	});
});
