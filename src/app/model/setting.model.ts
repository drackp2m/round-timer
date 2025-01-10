import { SettingTypeKey } from '@app/definition/model/setting/setting-type.enum';
import { SettingPayload } from '@app/definition/model/setting/setting-type.type';
import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { RepositoryModel } from '@app/model/repository.model';

export class Setting<T extends SettingTypeKey = SettingTypeKey> extends RepositoryModel<Setting> {
	readonly uuid!: string;
	readonly type!: T;
	readonly payload!: SettingPayload[T];
	readonly createdAt!: Date;
	readonly updatedAt!: Date;

	constructor(model: ModelConstructorOmit<Setting>) {
		super();

		this.setInitialValues();

		Object.assign(this, model);
	}

	private setInitialValues(): void {
		const now = new Date();

		const values: Partial<Setting> = {
			uuid: crypto.randomUUID(),
			createdAt: now,
		};

		Object.assign(this, values);
	}
}
