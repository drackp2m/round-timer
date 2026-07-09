import { faker } from '@faker-js/faker';

import { GameTurnOrder } from '@app/definition/model/game/game-turn-order.enum';
import { GameTurnType } from '@app/definition/model/game/game-turn-type.enum';
import { GameVictoryType } from '@app/definition/model/game/game-victory-type.enum';
import { ModelConstructorOmit } from '@app/definition/model/model-constructor-omit.type';
import { Game } from '@app/model/game.model';
import { Factory } from '@app/testing/factory/factory';
import { randomEnumKey } from '@app/testing/faker/basic.faker';

// The exact prop set the Game constructor accepts (uuid/dates are auto-generated).
export type GameProps = ModelConstructorOmit<Game>;

class GameFactory extends Factory<Game, GameProps> {
	protected definition(): GameProps {
		return {
			name: faker.commerce.productName(),
			maxPlayers: faker.number.int({ min: 2, max: 8 }),
			turnType: randomEnumKey(GameTurnType),
			turnOrder: randomEnumKey(GameTurnOrder),
			victoryType: randomEnumKey(GameVictoryType),
		};
	}

	protected build(props: GameProps): Game {
		return new Game(props);
	}
}

export const gameFactory = new GameFactory();
