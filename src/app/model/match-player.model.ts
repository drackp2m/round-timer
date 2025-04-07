import { ModelConstructorOmit } from '@app/definition/model/model-constructor-omit.type';
import { UpdatableModel } from '@app/model/updatable.model';

export class MatchPlayer extends UpdatableModel<MatchPlayer> {
	readonly matchUuid!: string;
	readonly playerUuid!: string;

	constructor(model: ModelConstructorOmit<MatchPlayer>) {
		super();

		Object.assign(this, model);
	}
}
