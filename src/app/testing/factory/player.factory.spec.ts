import { faker } from '@faker-js/faker';

import { PlayerColor } from '@app/definition/model/player/player-color.enum';
import { PlayerIcon } from '@app/definition/model/player/player-icon.enum';
import { Player } from '@app/model/player.model';
import { playerFactory } from '@app/testing/factory/player.factory';

describe('playerFactory', () => {
	beforeEach(() => {
		faker.seed(1);
	});

	it('builds a valid Player populated with generated data', () => {
		const player = playerFactory.makeOne();

		expect(player).toBeInstanceOf(Player);
		expect(player.uuid).toBeTruthy();
		expect(player.name).toBeTruthy();
		expect(Object.keys(PlayerColor)).toContain(player.color);
		expect(Object.keys(PlayerIcon)).toContain(player.icon);
	});

	it('derives `computed` from the generated color and icon', () => {
		const player = playerFactory.makeOne({ color: 'RED', icon: 'GHOST' });

		expect(player.computed.colorValue).toBe(PlayerColor.RED);
		expect(player.computed.iconValue).toBe(PlayerIcon.GHOST);
	});
});
