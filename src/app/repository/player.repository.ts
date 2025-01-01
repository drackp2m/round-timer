import { Injectable } from '@angular/core';
import { StoreNames, StoreValue } from 'idb';

import { PlayerSchema } from '@app/repository/definition/player-schema.interface';
import { Player } from '@app/model/player.model';

import { GenericRepository } from './generic.repository';

@Injectable({
	providedIn: 'root',
})
export class PlayerRepository extends GenericRepository<PlayerSchema> {
	override async getAll<K extends StoreNames<PlayerSchema>>(
		storeName: K,
	): Promise<StoreValue<PlayerSchema, K>[]> {
		return await super.getAll(storeName).then((items) => items.map((item) => new Player(item)));
	}
}
