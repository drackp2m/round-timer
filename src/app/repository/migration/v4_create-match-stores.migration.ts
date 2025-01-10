import { AppSchema } from '@app/repository/definition/app-schema.interface';
import { Migration } from '@app/repository/definition/migration.interface';

export const createMatchStoresMigration: Migration<AppSchema> = {
	version: 4,
	description: 'create match stores',
	apply: ({ database, oldVersion }) => {
		if (4 > oldVersion) {
			const matchStore = database.createObjectStore('match', { keyPath: 'uuid' });
			matchStore.createIndex('game_uuid', 'gameUuid', { unique: false });
			matchStore.createIndex('status', 'status', { unique: false });

			const matchPlayerStore = database.createObjectStore('match_player', { keyPath: 'uuid' });
			matchPlayerStore.createIndex('match_uuid', 'matchUuid', { unique: false });
			matchPlayerStore.createIndex('player_uuid', 'playerUuid', { unique: false });

			const matchEventStore = database.createObjectStore('match_event', { keyPath: 'uuid' });
			matchEventStore.createIndex('match_uuid', 'matchUuid', { unique: false });
		}
	},
};
