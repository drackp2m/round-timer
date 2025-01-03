export enum MatchStatus {
	IN_PROGRESS = 'in-progress',
	FINISHED = 'finished',
	VICTORY = 'victory',
	DEFEAT = 'defeat',
}

export type MatchStatusKey = keyof typeof MatchStatus;
