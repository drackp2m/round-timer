import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { RepositoryModel } from '@app/model/repository.model';

export class MatchEvent extends RepositoryModel<MatchEvent> {
	readonly uuid!: string;
	readonly matchUuid!: string;
	readonly playerUuid!: string;
	readonly createdAt!: Date;

	constructor(model: ModelConstructorOmit<MatchEvent>) {
		super();

		this.setInitialValues();

		Object.assign(this, model);
	}

	private setInitialValues(): void {
		const now = new Date();

		const values: Partial<MatchEvent> = {
			uuid: crypto.randomUUID(),
			createdAt: now,
		};

		Object.assign(this, values);
	}
}
