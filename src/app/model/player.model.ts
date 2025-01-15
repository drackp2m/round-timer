import { PlayerColor, PlayerColorKey } from '@app/definition/model/player/player-color.enum';
import { PlayerIcon, PlayerIconKey } from '@app/definition/model/player/player-icon.enum';
import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { UpdatableModel } from '@app/model/updatable.model';

interface Computed {
	colorValue: string;
	iconValue: string;
}

export class Player extends UpdatableModel<Player> {
	readonly name!: string;
	readonly nick!: string;
	readonly color!: PlayerColorKey;
	readonly icon!: PlayerIconKey;

	computed!: Computed;

	constructor(model: ModelConstructorOmit<Player, 'computed'>) {
		super();

		this.setComputedData(model);

		Object.assign(this, model);
	}

	private setComputedData(model: ModelConstructorOmit<Player, 'computed'>): void {
		const computed: Computed = {
			colorValue: PlayerColor[model.color],
			iconValue: PlayerIcon[model.icon],
		};

		Object.assign(this, { computed });
	}
}
