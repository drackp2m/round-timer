import { AppSchemas } from '@app/repository/definition/app-schemas.interface';
import { Migration } from '@app/repository/definition/migration.interface';

export const createPlayerNickIndexMigration: Migration<AppSchemas> = {
	version: 2,
	description: 'create player nick index',
	apply: ({ oldVersion, transaction }) => {
		if (2 > oldVersion) {
			const store = transaction.objectStore('player');
			store.createIndex('nick', 'nick', { unique: true });
		}
	},
};
