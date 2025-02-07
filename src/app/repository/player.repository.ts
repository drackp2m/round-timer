import { Injectable } from '@angular/core';
import { StoreNames, StoreValue } from 'idb';

import { Player } from '@app/model/player.model';
import { PlayerSchema } from '@app/repository/definition/player-schema.interface';
import { GenericRepository } from '@app/repository/generic.repository';

@Injectable({
	providedIn: 'root',
})
export class PlayerRepository extends GenericRepository<PlayerSchema> {
	override async findAll<K extends StoreNames<PlayerSchema>>(
		storeName: K,
	): Promise<StoreValue<PlayerSchema, K>[]> {
		return await super.findAll(storeName).then((items) => items.map((item) => new Player(item)));
	}
}
