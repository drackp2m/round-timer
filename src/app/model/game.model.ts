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

	constructor(model: Omit<Game, 'uuid' | 'createdAt' | 'updatedAt'>) {
		this.name = model.name;
		this.maxPlayers = model.maxPlayers;
		this.turnType = model.turnType;
		this.turnOrder = model.turnOrder;
	}
}
