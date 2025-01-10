export enum SettingType {
	THEME = 'theme',
	PAUSE_AFTER_NEXT_TURN = 'pause-after-next-turn',
}

export type SettingTypeKey = keyof typeof SettingType;
