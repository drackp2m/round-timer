import { MatchEventType as MatchEventTypeEnum } from '@app/definition/match/match-event-type.enum';

export interface MatchEventType {
	[MatchEventTypeEnum.SET_TURN_ORDER]: 'SET_TURN_ORDER';
	[MatchEventTypeEnum.NEXT_TURN]: 'NEXT_TURN';
	[MatchEventTypeEnum.PREVIOUS_TURN]: 'PREVIOUS_TURN';
	[MatchEventTypeEnum.SKIP_TURN]: 'SKIP_TURN';
	[MatchEventTypeEnum.PAUSE]: 'PAUSE';
	[MatchEventTypeEnum.RESUME]: 'RESUME';
	[MatchEventTypeEnum.ROLLBACK]: 'ROLLBACK';
	[MatchEventTypeEnum.NEXT_STAGE]: 'NEXT_STAGE';
	[MatchEventTypeEnum.END]: 'END';
}

export interface MatchEventPayload {
	[MatchEventTypeEnum.SET_TURN_ORDER]: string[];
	[MatchEventTypeEnum.NEXT_TURN]: undefined;
	[MatchEventTypeEnum.PREVIOUS_TURN]: undefined;
	[MatchEventTypeEnum.SKIP_TURN]: undefined;
	[MatchEventTypeEnum.PAUSE]: undefined;
	[MatchEventTypeEnum.RESUME]: undefined;
	[MatchEventTypeEnum.ROLLBACK]: undefined;
	[MatchEventTypeEnum.NEXT_STAGE]: undefined;
	[MatchEventTypeEnum.END]: undefined;
}

/**
 * ToDo => check this Copilot code...
 *
// 1. Usando mapped types directamente con el enum
type MatchEventType = {
    [K in keyof typeof MatchEventType]: Uppercase<K>;
};

type MatchEventPayload = {
    [K in keyof typeof MatchEventType]: K extends 'SET_TURN_ORDER' ? string[] : undefined;
};

// 2. O siendo más explícito con los valores pero manteniendo el DRY
type EventTypes = {
    SET_TURN_ORDER: { type: 'SET_TURN_ORDER'; payload: string[] };
    NEXT_TURN: { type: 'NEXT_TURN'; payload: undefined };
    PREVIOUS_TURN: { type: 'PREVIOUS_TURN'; payload: undefined };
    SKIP_TURN: { type: 'SKIP_TURN'; payload: undefined };
    PAUSE: { type: 'PAUSE'; payload: undefined };
    RESUME: { type: 'RESUME'; payload: undefined };
    ROLLBACK: { type: 'ROLLBACK'; payload: undefined };
    NEXT_STAGE: { type: 'NEXT_STAGE'; payload: undefined };
    END: { type: 'END'; payload: undefined };
};

type MatchEventType = {
    [K in keyof EventTypes]: EventTypes[K]['type'];
};

type MatchEventPayload = {
    [K in keyof EventTypes]: EventTypes[K]['payload'];
};

// 3. O incluso más conciso usando template literal types
type EventName = keyof typeof MatchEventType;
type MatchEventType = {
    [K in EventName]: Uppercase<K>;
};

type MatchEventPayload = {
    [K in EventName]: K extends 'SET_TURN_ORDER' ? string[] : undefined;
};
 */
