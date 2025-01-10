import { AppSchema } from '@app/repository/definition/app-schema.interface';
import { Migration } from '@app/repository/definition/migration.interface';

export const createPlayerStoreMigration: Migration<AppSchema> = {
	version: 1,
	description: 'create player store',
	apply: ({ database }) => {
		database.createObjectStore('player', { keyPath: 'uuid' });
	},
};
