import { faker } from '@faker-js/faker';

import { Setting } from '@app/model/setting.model';
import { settingFactory } from '@app/testing/factory/setting.factory';

describe('settingFactory', () => {
	beforeEach(() => {
		faker.seed(1);
	});

	it('builds a valid Setting with a coherent type/payload pair', () => {
		const settings = settingFactory.make(10);

		for (const setting of settings) {
			expect(setting).toBeInstanceOf(Setting);

			if ('THEME' === setting.type) {
				expect(['light', 'dark', 'system']).toContain(setting.payload);
			} else {
				expect(typeof setting.payload).toBe('boolean');
			}
		}
	});

	it('makeOfType builds the requested type with a matching payload', () => {
		const setting = settingFactory.makeOfType('PAUSE_AFTER_NEXT_TURN');

		expect(setting.type).toBe('PAUSE_AFTER_NEXT_TURN');
		expect(typeof setting.payload).toBe('boolean');
	});

	it('makeOfType accepts an explicit payload, including falsy ones', () => {
		const setting = settingFactory.makeOfType('PAUSE_AFTER_NEXT_TURN', false);

		expect(setting.payload).toBe(false);
	});
});
