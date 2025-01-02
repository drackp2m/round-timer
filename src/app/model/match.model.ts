import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { RepositoryModel } from '@app/model/repository.model';

export class Match extends RepositoryModel<Match> {
	readonly uuid!: string;
	readonly gameUuid!: string;
	readonly name?: string;
	readonly createdAt!: Date;
	readonly updatedAt!: Date;

	constructor(model: ModelConstructorOmit<Match>) {
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
