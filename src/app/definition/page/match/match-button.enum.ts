export enum MatchButton {
	PREVIOUS = 'previous',
	STOP = 'stop',
	PLAY_PAUSE = 'play-pause',
	NEXT = 'next',
}

export type MatchButtonKey = keyof typeof MatchButton;
