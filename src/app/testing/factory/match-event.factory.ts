import { faker } from '@faker-js/faker';

import {
	MatchEventType,
	MatchEventTypeKey,
} from '@app/definition/model/match/match-event-type.enum';
import { MatchEventPayload } from '@app/definition/model/match/match-event-type.type';
import { ModelConstructorOmit } from '@app/definition/model/model-constructor-omit.type';
import { MatchEvent } from '@app/model/match-event.model';
import { Factory } from '@app/testing/factory/factory';
import { randomEnumKey } from '@app/testing/faker/basic.faker';

export type MatchEventProps = ModelConstructorOmit<MatchEvent>;

type EventPayloadFor<K extends MatchEventTypeKey> = MatchEventPayload[(typeof MatchEventType)[K]];

// One payload generator per event type keeps every generated pair coherent:
// only SET_TURN_ORDER carries a payload (the ordered player uuids).
const payloadByType: { [K in MatchEventTypeKey]: () => EventPayloadFor<K> } = {
	SET_TURN_ORDER: () => faker.helpers.multiple(() => faker.string.uuid(), { count: 3 }),
	NEXT_TURN: () => undefined,
	PREVIOUS_TURN: () => undefined,
	SKIP_TURN: () => undefined,
	PAUSE: () => undefined,
	RESUME: () => undefined,
	ROLLBACK: () => undefined,
	NEXT_STAGE: () => undefined,
	END: () => undefined,
};

class MatchEventFactory extends Factory<MatchEvent, MatchEventProps> {
	/**
	 * Coherent `type`/`payload` pair. Prefer this over `makeOne({ type })`,
	 * which would keep a payload generated for a different type.
	 */
	makeOfType(type: MatchEventTypeKey, overrides: Partial<MatchEventProps> = {}): MatchEvent {
		return this.makeOne({ type, payload: payloadByType[type](), ...overrides });
	}

	protected definition(): MatchEventProps {
		const type = randomEnumKey(MatchEventType);

		return {
			// Foreign key: scenario builders should override it with a real Match uuid.
			matchUuid: faker.string.uuid(),
			type,
			payload: payloadByType[type](),
		};
	}

	protected build(props: MatchEventProps): MatchEvent {
		return new MatchEvent(props);
	}
}

export const matchEventFactory = new MatchEventFactory();
