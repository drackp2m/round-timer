import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { RepositoryModel } from '@app/model/repository.model';

export class MatchPlayer extends RepositoryModel<MatchPlayer> {
	readonly uuid!: string;
	readonly matchUuid!: string;
	readonly playerUuid!: string;
	readonly createdAt!: Date;

	constructor(model: ModelConstructorOmit<MatchPlayer>) {
		super();

		this.setInitialValues();

		Object.assign(this, model);
	}

	private setInitialValues(): void {
		const now = new Date();

		const values: Partial<MatchPlayer> = {
			uuid: crypto.randomUUID(),
			createdAt: now,
		};

		Object.assign(this, values);
	}
}
