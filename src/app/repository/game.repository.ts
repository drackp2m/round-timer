import { Injectable } from '@angular/core';
import { StoreNames, StoreValue } from 'idb';

import { Game } from '@app/model/game.model';
import { GameSchema } from '@app/repository/definition/game-schema.interface';

import { GenericRepository } from './generic.repository';

@Injectable({
	providedIn: 'root',
})
export class GameRepository extends GenericRepository<GameSchema> {
	override async getAll<K extends StoreNames<GameSchema>>(
		storeName: K,
	): Promise<StoreValue<GameSchema, K>[]> {
		return await super.getAll(storeName).then((items) => items?.map((item) => new Game(item)));
	}
}
