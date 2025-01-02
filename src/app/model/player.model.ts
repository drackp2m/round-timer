import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { PlayerColor, PlayerColorKey } from '@app/definition/player/player-color.enum';
import { PlayerIcon, PlayerIconKey } from '@app/definition/player/player-icon.enum';
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

		this.setComputed(model);

		Object.assign(this, model);
	}

	private setComputed(model: ModelConstructorOmit<Player>): void {
		const now = new Date();

		Object.assign(this, {
			uuid: crypto.randomUUID(),
			createdAt: now,
			updatedAt: now,
			computed: {
				colorValue: PlayerColor[model.color],
				iconValue: PlayerIcon[model.icon],
			},
		});
	}
}
