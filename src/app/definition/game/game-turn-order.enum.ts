export enum GameTurnOrder {
	ALWAYS_FIXED = 'always-fixed',
	FIXED_PER_STAGE = 'fixed-per-stage',
	EACH_ROUND_DIFFERENT = 'each-round-different',
}

export type GameTurnOrderKey = keyof typeof GameTurnOrder;
