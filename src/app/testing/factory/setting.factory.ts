import { faker } from '@faker-js/faker';

import { ModelConstructorOmit } from '@app/definition/model/model-constructor-omit.type';
import { SettingType, SettingTypeKey } from '@app/definition/model/setting/setting-type.enum';
import { SettingPayload } from '@app/definition/model/setting/setting-type.type';
import { Setting } from '@app/model/setting.model';
import { Factory } from '@app/testing/factory/factory';
import { randomEnumKey } from '@app/testing/faker/basic.faker';

export type SettingProps = ModelConstructorOmit<Setting>;

// One payload generator per setting type keeps every generated pair coherent.
const payloadByType: { [K in SettingTypeKey]: () => SettingPayload[K] } = {
	THEME: () => faker.helpers.arrayElement(['light', 'dark', 'system'] as const),
	PAUSE_AFTER_NEXT_TURN: () => faker.datatype.boolean(),
};

class SettingFactory extends Factory<Setting, SettingProps> {
	/**
	 * Coherent `type`/`payload` pair. Prefer this over `makeOne({ type })`,
	 * which would keep a payload generated for a different type.
	 */
	makeOfType<K extends SettingTypeKey>(type: K, payload?: SettingPayload[K]): Setting<K> {
		return this.makeOne({ type, payload: payload ?? payloadByType[type]() }) as Setting<K>;
	}

	protected definition(): SettingProps {
		const type = randomEnumKey(SettingType);

		return { type, payload: payloadByType[type]() };
	}

	protected build(props: SettingProps): Setting {
		return new Setting(props);
	}
}

export const settingFactory = new SettingFactory();
