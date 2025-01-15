import { GameTurnOrderKey } from '@app/definition/model/game/game-turn-order.enum';
import { GameTurnTypeKey } from '@app/definition/model/game/game-turn-type.enum';
import { GameVictoryTypeKey } from '@app/definition/model/game/game-victory-type.enum';
import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { UpdatableModel } from '@app/model/updatable.model';

export class Game extends UpdatableModel<Game> {
	readonly name!: string;
	readonly maxPlayers!: number;
	readonly turnType!: GameTurnTypeKey;
	readonly turnOrder!: GameTurnOrderKey;
	readonly victoryType!: GameVictoryTypeKey;

	constructor(model: ModelConstructorOmit<Game>) {
		super();

		Object.assign(this, model);
	}
}
