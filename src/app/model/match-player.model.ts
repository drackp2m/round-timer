import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { RepositoryModel } from '@app/model/repository.model';

export class MatchPlayer extends RepositoryModel<MatchPlayer> {
	readonly uuid!: string;
	readonly matchUuid!: string;
	readonly userUuid!: string;
	readonly createdAt!: Date;

	constructor(model: ModelConstructorOmit<MatchPlayer>) {
		super();

		this.setComputed();

		Object.assign(this, model);
	}

	private setComputed(): void {
		const now = new Date();

		Object.assign(this, {
			uuid: crypto.randomUUID(),
			createdAt: now,
		});
	}
}
