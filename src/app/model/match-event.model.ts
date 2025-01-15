import { MatchEventType } from '@app/definition/model/match/match-event-type.enum';
import {
	MatchEventPayload,
	MatchEventType as MatchEventTypeType,
} from '@app/definition/model/match/match-event-type.type';
import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { BaseModel } from '@app/model/base.model';

export class MatchEvent<T extends MatchEventType = MatchEventType> extends BaseModel<MatchEvent> {
	readonly matchUuid!: string;
	readonly type!: MatchEventTypeType[T];
	readonly payload!: MatchEventPayload[T];

	constructor(model: ModelConstructorOmit<MatchEvent>) {
		super();

		Object.assign(this, model);
	}
}
