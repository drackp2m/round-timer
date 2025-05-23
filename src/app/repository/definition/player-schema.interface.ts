import { DBSchema } from 'idb';

import { Player } from '@app/model/player.model';

export interface PlayerSchema extends DBSchema {
	player: {
		key: string;
		value: Player;
		indexes: { nick: string };
	};
}
