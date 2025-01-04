import { MatchStatusKey } from '@app/definition/match/match-status.enum';
import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { RepositoryModel } from '@app/model/repository.model';

export class Match extends RepositoryModel<Match> {
	readonly uuid!: string;
	readonly gameUuid!: string;
	readonly name?: string;
	readonly status!: MatchStatusKey;
	readonly createdAt!: Date;
	readonly updatedAt!: Date;

	constructor(model: ModelConstructorOmit<Match>) {
		super();

		this.setInitialValues();

		Object.assign(this, model);
	}

	private setInitialValues(): void {
		const now = new Date();

		const values: Partial<Match> = {
			uuid: crypto.randomUUID(),
			status: 'IN_PROGRESS',
			createdAt: now,
			updatedAt: now,
		};

		Object.assign(this, values);
	}
}
