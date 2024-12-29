import { Player } from '@app/model/player.model';

export class Game {
	readonly uuid: string;
	readonly name: string;
	readonly players: Player[];

	constructor(name: string, players: Player[]) {
		this.uuid = crypto.randomUUID();
		this.name = name;
		this.players = players;
	}
}
