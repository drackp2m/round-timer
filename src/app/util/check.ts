import {
	MatchEventType,
	MatchEventTypeKey,
} from '@app/definition/model/match/match-event-type.enum';
import { MatchEvent } from '@app/model/match-event.model';

export abstract class Check {
	static typedValueIsEmpty<T>(value: T | null): boolean {
		return '' === (value as unknown as string) && null !== value;
	}

	static isFalseAsStringOrTrue(value: boolean | string): boolean {
		return 'string' === typeof value ? 'false' !== value : value;
	}

	static isEventType<K extends MatchEventTypeKey>(
		event: MatchEvent,
		eventType: K,
	): event is MatchEvent<(typeof MatchEventType)[K]> {
		return event.type === eventType;
	}
}
