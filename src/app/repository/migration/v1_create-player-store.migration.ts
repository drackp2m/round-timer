import { Migration } from '@app/repository/definition/migration.interface';
import { IDBPDatabaseSchemas } from '@app/repository/migration-handler';

export const createPlayerStoreMigration: Migration<IDBPDatabaseSchemas> = {
	version: 1,
	description: 'create player store',
	apply: ({ database }) => {
		database.createObjectStore('player');
	},
};
