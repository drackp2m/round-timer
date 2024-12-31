import { Injectable } from '@angular/core';
import { Player } from '@app/model/player.model';

import { PlayerSchema } from '@app/definition/player/player-schema.interface';

import { GenericRepository } from './generic.repository';

@Injectable({
	providedIn: 'root',
})
export class PlayerRepository extends GenericRepository<PlayerSchema> {
	override async getAll<K extends 'player'>(
		storeName: K,
	): Promise<PlayerSchema[K]['value'][] | undefined> {
		const items = await super.getAll(storeName);

		if (items === undefined) {
			return undefined;
		}

		return items.map((item) => new Player(item.name, item.nick, item.color, item.icon));
	}
}
