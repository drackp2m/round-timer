import { MatchEventType as MatchEventTypeEnum } from '@app/definition/match/match-event-type.enum';

interface MatchEventBase {
	uuid: string;
	game_uuid: string;
	created_at: Date;
}

interface MatchNextTurnEvent extends MatchEventBase {
	type: MatchEventTypeEnum.NEXT_TURN;
	player_uuid: string;
}

interface MatchEventsWithoutProps extends MatchEventBase {
	type:
		| MatchEventTypeEnum.PREVIOUS_TURN
		| MatchEventTypeEnum.SKIP_TURN
		| MatchEventTypeEnum.PAUSE
		| MatchEventTypeEnum.RESUME
		| MatchEventTypeEnum.ROLLBACK
		| MatchEventTypeEnum.NEXT_STAGE
		| MatchEventTypeEnum.END;
}

export type MatchEventType = MatchNextTurnEvent | MatchEventsWithoutProps;
