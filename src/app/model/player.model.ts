import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { PlayerColor, PlayerColorKey } from '@app/definition/model/player/player-color.enum';
import { PlayerIcon, PlayerIconKey } from '@app/definition/model/player/player-icon.enum';
import { RepositoryModel } from '@app/model/repository.model';

interface Computed {
	colorValue: string;
	iconValue: string;
}

export class Player extends RepositoryModel<Player> {
	readonly uuid!: string;
	readonly name!: string;
	readonly nick!: string;
	readonly color!: PlayerColorKey;
	readonly icon!: PlayerIconKey;
	readonly createdAt!: Date;
	readonly updatedAt!: Date;

	computed!: Computed;

	constructor(model: ModelConstructorOmit<Player>) {
		super();

		this.setInitialValues();

		this.setComputedData(model);

		Object.assign(this, model);
	}

	private setInitialValues(): void {
		const now = new Date();

		const values: Partial<Player> = {
			uuid: crypto.randomUUID(),
			createdAt: now,
			updatedAt: now,
		};

		Object.assign(this, values);
	}

	private setComputedData(model: ModelConstructorOmit<Player>): void {
		const computed: Computed = {
			colorValue: PlayerColor[model.color],
			iconValue: PlayerIcon[model.icon],
		};

		Object.assign(this, { computed });
	}
}
