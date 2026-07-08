import { faker } from '@faker-js/faker';

import { MatchStatusKey } from '@app/definition/model/match/match-status.enum';
import { ModelConstructorOmit } from '@app/definition/model/model-constructor-omit.type';
import { Match } from '@app/model/match.model';
import { Factory } from '@app/testing/factory/factory';

/**
 * The Match constructor always starts at `IN_PROGRESS`; `status` here is an
 * extra factory-only prop applied through `with()` so tests can build finished
 * matches directly. Note that `with()` bumps `updatedAt` past `createdAt`.
 */
export type MatchProps = ModelConstructorOmit<Match, 'status'> & { status?: MatchStatusKey };

class MatchFactory extends Factory<Match, MatchProps> {
	protected definition(): MatchProps {
		return {
			// Foreign key: scenario builders should override it with a real Game uuid.
			gameUuid: faker.string.uuid(),
			name: faker.commerce.productName(),
		};
	}

	protected build({ status, ...props }: MatchProps): Match {
		const match = new Match(props);

		return undefined === status ? match : match.with({ status });
	}
}

export const matchFactory = new MatchFactory();
