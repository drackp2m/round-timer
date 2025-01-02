import { GameTurnOrderKey } from '@app/definition/game/game-turn-order.enum';
import { GameTurnTypeKey } from '@app/definition/game/game-turn-type.enum';
import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { RepositoryModel } from '@app/model/repository.model';

export class Game extends RepositoryModel<Game> {
	readonly uuid!: string;
	readonly name!: string;
	readonly maxPlayers!: number;
	readonly turnType!: GameTurnTypeKey;
	readonly turnOrder!: GameTurnOrderKey;
	readonly createdAt!: Date;
	readonly updatedAt!: Date;

	constructor(model: ModelConstructorOmit<Game>) {
		super();

		this.setComputed();

		Object.assign(this, model);
	}

	private setComputed(): void {
		const now = new Date();

		Object.assign(this, {
			uuid: crypto.randomUUID(),
			createdAt: now,
			updatedAt: now,
		});
	}
}
