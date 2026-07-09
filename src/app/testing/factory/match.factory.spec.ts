import { faker } from '@faker-js/faker';

import { Match } from '@app/model/match.model';
import { matchFactory } from '@app/testing/factory/match.factory';

describe('matchFactory', () => {
	beforeEach(() => {
		faker.seed(1);
	});

	it('builds a Match that starts IN_PROGRESS by default', () => {
		const match = matchFactory.makeOne();

		expect(match).toBeInstanceOf(Match);
		expect(match.uuid).toBeTruthy();
		expect(match.gameUuid).toBeTruthy();
		expect(match.status).toBe('IN_PROGRESS');
	});

	it('applies a status override through with(), keeping the Match a model instance', () => {
		const match = matchFactory.makeOne({ status: 'VICTORY' });

		expect(match).toBeInstanceOf(Match);
		expect(match.status).toBe('VICTORY');
	});
});
