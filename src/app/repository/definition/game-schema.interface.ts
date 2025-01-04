import { DBSchema } from 'idb';

import { Game } from '@app/model/game.model';

// ToDo => Force index as value property
export interface GameSchema extends DBSchema {
	game: {
		key: string;
		value: Game;
		indexes: { name: string; victory_type: string };
	};
}
