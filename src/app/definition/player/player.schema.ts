import { DBSchema } from 'idb';

import { Player } from '../../model/player.model';

export interface PlayerSchema extends DBSchema {
	player: {
		key: string;
		value: Player;
		indexes: { nick: string };
	};
}
