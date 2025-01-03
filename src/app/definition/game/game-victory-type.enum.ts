export enum GameVictoryType {
	COOPERATIVE = 'cooperative',
	COMPETITIVE = 'competitive',
	TEAM_COMPETITIVE = 'team-competitive',
}

export type GameVictoryTypeKey = keyof typeof GameVictoryType;
