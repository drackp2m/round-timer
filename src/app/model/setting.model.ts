import { SettingTypeKey } from '@app/definition/model/setting/setting-type.enum';
import { SettingPayload } from '@app/definition/model/setting/setting-type.type';
import { ModelConstructorOmit } from '@app/definition/model-constructor-omit.type';
import { UpdatableModel } from '@app/model/updatable.model';

export class Setting<T extends SettingTypeKey = SettingTypeKey> extends UpdatableModel<Setting> {
	type!: T;
	payload!: SettingPayload[T];

	constructor(model: ModelConstructorOmit<Setting>) {
		super();

		Object.assign(this, model);
	}
}
