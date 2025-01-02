import { AppSchemas } from '@app/repository/definition/app-schemas.interface';
import { Migration } from '@app/repository/definition/migration.interface';

export const createGameStoreMigration: Migration<AppSchemas> = {
	version: 3,
	description: 'create game store',
	apply: ({ database, oldVersion }) => {
		if (3 > oldVersion) {
			const store = database.createObjectStore('game', { keyPath: 'uuid' });
			store.createIndex('name', 'name', { unique: true });
		}
	},
};
