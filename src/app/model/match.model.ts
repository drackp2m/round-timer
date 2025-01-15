import { MatchStatusKey } from '@app/definition/model/match/match-status.enum';
import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { UpdatableModel } from '@app/model/updatable.model';

export class Match extends UpdatableModel<Match> {
	readonly gameUuid!: string;
	readonly name?: string;
	readonly status!: MatchStatusKey;

	constructor(model: ModelConstructorOmit<Match, 'status'>) {
		super();

		Object.assign(this, model);
	}
}
