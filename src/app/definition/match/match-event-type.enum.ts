export enum MatchEventType {
	SET_TURN_ORDER = 'set-turn-order',
	NEXT_TURN = 'next-turn',
	PREVIOUS_TURN = 'previous-turn',
	SKIP_TURN = 'skip-turn',
	PAUSE = 'pause',
	RESUME = 'resume',
	ROLLBACK = 'rollback',
	NEXT_STAGE = 'next-stage',
	END = 'end',
}

export type MatchEventTypeKey = keyof typeof MatchEventType;
