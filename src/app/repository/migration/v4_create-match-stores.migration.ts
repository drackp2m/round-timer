import { AppSchemas } from '@app/repository/definition/app-schemas.interface';
import { Migration } from '@app/repository/definition/migration.interface';

export const createMatchStoresMigration: Migration<AppSchemas> = {
	version: 4,
	description: 'create match stores',
	apply: ({ database, oldVersion }) => {
		if (4 > oldVersion) {
			database.createObjectStore('match', { keyPath: 'uuid' });

			const matchUserStore = database.createObjectStore('match_player', { keyPath: 'uuid' });
			matchUserStore.createIndex('match_uuid', 'matchUuid', { unique: false });
			matchUserStore.createIndex('match_uuid', 'userUuid', { unique: false });

			const matchEventStore = database.createObjectStore('match_event', { keyPath: 'uuid' });
			matchEventStore.createIndex('match_uuid', 'matchUuid', { unique: false });
		}
	},
};
