import { DBSchema } from 'idb';

import { Game } from '@app/model/game.model';

export interface GameSchema extends DBSchema {
	game: {
		key: string;
		value: Game;
		indexes: { name: string };
	};
}
