import { AppSchemas } from '@app/repository/definition/app-schemas.interface';
import { Migration } from '@app/repository/definition/migration.interface';

export const createPlayerStoreMigration: Migration<AppSchemas> = {
	version: 1,
	description: 'create player store',
	apply: ({ database }) => {
		database.createObjectStore('player', { keyPath: 'uuid' });
	},
};
