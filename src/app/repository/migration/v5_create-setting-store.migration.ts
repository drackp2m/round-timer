import { AppSchema } from '@app/repository/definition/app-schema.interface';
import { Migration } from '@app/repository/definition/migration.interface';

export const createSettingStoreMigration: Migration<AppSchema> = {
	version: 5,
	description: 'create setting store',
	apply: ({ database, oldVersion }) => {
		if (5 > oldVersion) {
			const store = database.createObjectStore('setting', { keyPath: 'uuid' });
			store.createIndex('type', 'type', { unique: true });
		}
	},
};
