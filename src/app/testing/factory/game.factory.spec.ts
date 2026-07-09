import { faker } from '@faker-js/faker';

import { Game } from '@app/model/game.model';
import { gameFactory } from '@app/testing/factory/game.factory';

describe('gameFactory', () => {
	// Seed faker so the generated data is deterministic across runs.
	beforeEach(() => {
		faker.seed(1);
	});

	it('builds a valid Game populated with generated data', () => {
		const game = gameFactory.makeOne();

		expect(game).toBeInstanceOf(Game);
		expect(game.uuid).toBeTruthy();
		expect(game.name).toBeTruthy();
		expect(game.maxPlayers).toBeGreaterThanOrEqual(2);
		expect(game.maxPlayers).toBeLessThanOrEqual(8);
		expect(['EQUITABLE', 'PASS_ONCE', 'PASS_SOME']).toContain(game.turnType);
	});

	it('lets callers override any field, keeping the rest generated', () => {
		const game = gameFactory.makeOne({ name: 'Catan', maxPlayers: 4 });

		expect(game.name).toBe('Catan');
		expect(game.maxPlayers).toBe(4);
		// Untouched fields still come from the factory.
		expect(game.turnType).toBeTruthy();
	});

	it('make(n) returns n independent games', () => {
		const games = gameFactory.make(3);

		expect(games).toHaveLength(3);
		expect(new Set(games.map((game) => game.uuid)).size).toBe(3);
	});
});
