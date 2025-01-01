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

	constructor(model: Omit<Player, 'uuid' | 'createdAt' | 'updateAt'>) {
		this.name = model.name;
		this.nick = model.nick;
		this.color = model.color;
		this.colorValue = PlayerColor[model.color];
		this.icon = model.icon;
		this.iconValue = PlayerIcon[model.icon];
	}
}
