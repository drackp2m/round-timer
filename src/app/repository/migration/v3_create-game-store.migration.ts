import { AppSchema } from '@app/repository/definition/app-schema.interface';
import { Migration } from '@app/repository/definition/migration.interface';

export const createGameStoreMigration: Migration<AppSchema> = {
	version: 3,
	description: 'create game store',
	apply: ({ database, oldVersion }) => {
		if (3 > oldVersion) {
			const store = database.createObjectStore('game', { keyPath: 'uuid' });
			store.createIndex('name', 'name', { unique: true });
			store.createIndex('victory_type', 'victoryType', { unique: true });
		}
	},
};
