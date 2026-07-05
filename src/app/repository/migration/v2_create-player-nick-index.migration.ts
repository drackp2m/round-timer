import { AppSchema } from '@app/repository/definition/app-schema.interface';
import { Migration } from '@app/repository/definition/migration.interface';

export const createPlayerNickIndexMigration: Migration<AppSchema> = {
	version: 2,
	description: 'create player nick index',
	apply: ({ transaction }) => {
		const store = transaction.objectStore('player');
		store.createIndex('nick', 'nick', { unique: true });
	},
};
