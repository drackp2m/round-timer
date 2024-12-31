import { GameTurnOrderKey } from '@app/definition/game/game-turn-order.enum';
import { GameTurnTypeKey } from '@app/definition/game/game-turn-type.enum';

export class Game {
	private readonly NOW = new Date();

	readonly uuid: string = crypto.randomUUID();
	readonly name: string;
	readonly maxPlayers: number;
	readonly turnType: GameTurnTypeKey;
	readonly turnOrder: GameTurnOrderKey;
	readonly createdAt: Date = this.NOW;
	readonly updatedAt: Date = this.NOW;

	constructor(
		name: string,
		maxPlayers: number,
		turnType: GameTurnTypeKey,
		turnOrder: GameTurnOrderKey,
	) {
		this.name = name;
		this.maxPlayers = maxPlayers;
		this.turnType = turnType;
		this.turnOrder = turnOrder;
	}
}
