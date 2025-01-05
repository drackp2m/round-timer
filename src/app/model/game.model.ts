import { GameTurnOrderKey } from '@app/definition/model/game/game-turn-order.enum';
import { GameTurnTypeKey } from '@app/definition/model/game/game-turn-type.enum';
import { GameVictoryTypeKey } from '@app/definition/model/game/game-victory-type.enum';
import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { RepositoryModel } from '@app/model/repository.model';

export class Game extends RepositoryModel<Game> {
	readonly uuid!: string;
	readonly name!: string;
	readonly maxPlayers!: number;
	readonly turnType!: GameTurnTypeKey;
	readonly turnOrder!: GameTurnOrderKey;
	readonly victoryType!: GameVictoryTypeKey;
	readonly createdAt!: Date;
	readonly updatedAt!: Date;

	constructor(model: ModelConstructorOmit<Game>) {
		super();

		this.setInitialValues();

		Object.assign(this, model);
	}

	private setInitialValues(): void {
		const now = new Date();

		const values: Partial<Game> = {
			uuid: crypto.randomUUID(),
			createdAt: now,
			updatedAt: now,
		};

		Object.assign(this, values);
	}
}
