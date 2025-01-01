import { Migration } from '@app/repository/definition/migration.interface';
import { IDBPDatabaseSchemas } from '@app/repository/migration-handler';

export const createGameStoreMigration: Migration<IDBPDatabaseSchemas> = {
	version: 3,
	description: 'create game store',
	apply: ({ database, oldVersion }) => {
		if (3 > oldVersion) {
			const store = database.createObjectStore('game');
			store.createIndex('name', 'name', { unique: true });
		}
	},
};
