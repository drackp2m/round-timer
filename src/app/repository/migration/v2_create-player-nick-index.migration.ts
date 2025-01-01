import { Migration } from '@app/repository/definition/migration.interface';
import { IDBPDatabaseSchemas } from '@app/repository/migration-handler';

export const createPlayerNickIndexMigration: Migration<IDBPDatabaseSchemas> = {
	version: 2,
	description: 'create player nick index',
	apply: ({ oldVersion, transaction }) => {
		if (2 > oldVersion) {
			const store = transaction.objectStore('player');
			store.createIndex('nick', 'nick', { unique: true });
		}
	},
};
