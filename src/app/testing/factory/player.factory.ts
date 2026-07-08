import { faker } from '@faker-js/faker';

import { ModelConstructorOmit } from '@app/definition/model/model-constructor-omit.type';
import { PlayerColor } from '@app/definition/model/player/player-color.enum';
import { PlayerIcon } from '@app/definition/model/player/player-icon.enum';
import { Player } from '@app/model/player.model';
import { Factory } from '@app/testing/factory/factory';
import { randomEnumKey } from '@app/testing/faker/basic.faker';

// `computed` is derived by the Player constructor from `color`/`icon`, so it is not a prop.
export type PlayerProps = ModelConstructorOmit<Player, 'computed'>;

class PlayerFactory extends Factory<Player, PlayerProps> {
	protected definition(): PlayerProps {
		return {
			name: faker.person.firstName(),
			nick: faker.internet.username(),
			color: randomEnumKey(PlayerColor),
			icon: randomEnumKey(PlayerIcon),
		};
	}

	protected build(props: PlayerProps): Player {
		return new Player(props);
	}
}

export const playerFactory = new PlayerFactory();
