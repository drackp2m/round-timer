import { CalculateMatchTurns } from './calculate-match-turns.use-case';

import { MatchEventTypeKey } from '@app/definition/model/match/match-event-type.enum';
import { MatchEvent } from '@app/model/match-event.model';

describe('CalculateMatchTurns', () => {
	let service: CalculateMatchTurns;
	const MATCH_UUID = 'test-match-uuid';
	let currentUuid = 0;

	beforeEach(() => {
		service = new CalculateMatchTurns();

		Object.defineProperty(global.crypto, 'randomUUID', {
			value: () => `test-uuid-${(++currentUuid).toString()}`,
			configurable: true,
		});

		jest.useFakeTimers();
		jest.setSystemTime(new Date('2025-01-29T11:00:00Z'));
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should calculate turns with SET_TURN_ORDER and NEXT_TURN events', () => {
		service.addEvent(
			new MatchEvent({
				type: 'SET_TURN_ORDER',
				payload: ['player1', 'player2', 'player3'],
				matchUuid: MATCH_UUID,
			}),
		);

		jest.advanceTimersByTime(1000);

		service.addEvent(createEvent('NEXT_TURN'));

		jest.advanceTimersByTime(2000);

		service.addEvent(createEvent('NEXT_TURN'));

		jest.advanceTimersByTime(5000);

		service.addEvent(createEvent('NEXT_TURN'));

		jest.advanceTimersByTime(4500);

		const result = service.addEvent(createEvent('NEXT_TURN'));

		expect(result).toEqual([
			{ playerUuid: 'player1', time: 2000 },
			{ playerUuid: 'player2', time: 5000 },
			{ playerUuid: 'player3', time: 4500 },
			{ playerUuid: 'player1', time: 0 },
		]);
	});

	function createEvent(type: MatchEventTypeKey) {
		return new MatchEvent({
			type,
			payload: undefined,
			matchUuid: MATCH_UUID,
		});
	}
});
