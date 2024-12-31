export enum GameTurnType {
	EQUITABLE = 'equitable',
	PASS_ONCE = 'pass-once',
	PASS_SOME = 'pass-some',
}

export type GameTurnTypeKey = keyof typeof GameTurnType;
