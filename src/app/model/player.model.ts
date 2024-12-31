import { PlayerColor, PlayerColorKey } from '@app/definition/player/player-color.enum';
import { PlayerIcon, PlayerIconKey } from '@app/definition/player/player-icon.enum';

export class Player {
	private readonly NOW = new Date();

	readonly uuid: string = crypto.randomUUID();
	readonly name: string;
	readonly nick: string;
	readonly color: PlayerColorKey;
	readonly colorValue: string;
	readonly icon: PlayerIconKey;
	readonly iconValue: string;
	readonly createdAt: Date = this.NOW;
	readonly updateAt: Date = this.NOW;

	constructor(name: string, nick: string, color: PlayerColorKey, icon: PlayerIconKey) {
		this.name = name;
		this.nick = nick;
		this.color = color;
		this.colorValue = PlayerColor[color];
		this.icon = icon;
		this.iconValue = PlayerIcon[icon];
	}
}
