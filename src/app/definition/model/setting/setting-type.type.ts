import { Theme } from '@app/definition/service/theme.type';

export interface SettingType {
	THEME: 'THEME';
	PAUSE_AFTER_NEXT_TURN: 'PAUSE_AFTER_NEXT_TURN';
}

export interface SettingPayload {
	THEME: Theme | 'system';
	PAUSE_AFTER_NEXT_TURN: boolean;
}
