import { faker } from '@faker-js/faker';

import { MatchEvent } from '@app/model/match-event.model';
import { matchEventFactory } from '@app/testing/factory/match-event.factory';

describe('matchEventFactory', () => {
	beforeEach(() => {
		faker.seed(1);
	});

	it('builds MatchEvents with a coherent type/payload pair', () => {
		const events = matchEventFactory.make(20);

		for (const event of events) {
			expect(event).toBeInstanceOf(MatchEvent);

			if ('SET_TURN_ORDER' === event.type) {
				expect(Array.isArray(event.payload)).toBe(true);
			} else {
				expect(event.payload).toBeUndefined();
			}
		}
	});

	it('makeOfType builds the requested type and accepts overrides', () => {
		const event = matchEventFactory.makeOfType('SET_TURN_ORDER', {
			matchUuid: 'match-1',
			payload: ['player-1', 'player-2'],
		});

		expect(event.type).toBe('SET_TURN_ORDER');
		expect(event.matchUuid).toBe('match-1');
		expect(event.payload).toEqual(['player-1', 'player-2']);
	});
});
