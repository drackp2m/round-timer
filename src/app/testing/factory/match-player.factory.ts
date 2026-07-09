import { faker } from '@faker-js/faker';

import { ModelConstructorOmit } from '@app/definition/model/model-constructor-omit.type';
import { MatchPlayer } from '@app/model/match-player.model';
import { Factory } from '@app/testing/factory/factory';

export type MatchPlayerProps = ModelConstructorOmit<MatchPlayer>;

class MatchPlayerFactory extends Factory<MatchPlayer, MatchPlayerProps> {
	protected definition(): MatchPlayerProps {
		return {
			// Foreign keys: scenario builders should override them with real Match/Player uuids.
			matchUuid: faker.string.uuid(),
			playerUuid: faker.string.uuid(),
		};
	}

	protected build(props: MatchPlayerProps): MatchPlayer {
		return new MatchPlayer(props);
	}
}

export const matchPlayerFactory = new MatchPlayerFactory();
