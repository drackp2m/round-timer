import { PlayerColor } from '@app/definition/player/player-color.enum';
import { PlayerIcon } from '@app/definition/player/player-icon.enum';

export class Player {
	readonly uuid: string;
	readonly name: string;
	readonly nick: string;
	readonly color: keyof typeof PlayerColor;
	readonly colorValue: string;
	readonly icon: keyof typeof PlayerIcon;
	readonly iconValue: string;
	readonly createdAt: Date;
	readonly updateAt: Date;

	constructor(
		name: string,
		nick: string,
		color: keyof typeof PlayerColor,
		icon: keyof typeof PlayerIcon,
	) {
		this.uuid = crypto.randomUUID();
		this.name = name;
		this.nick = nick;
		this.color = color;
		this.colorValue = PlayerColor[color];
		this.icon = icon;
		this.iconValue = PlayerIcon[icon];
		this.createdAt = new Date();
		this.updateAt = new Date();
	}
}
