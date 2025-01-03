import { Injectable } from '@angular/core';
import { StoreNames, StoreValue } from 'idb';

import { MatchEvent } from '@app/model/match-event.model';
import { MatchPlayer } from '@app/model/match-participant.model';
import { Match } from '@app/model/match.model';
import { MatchSchema } from '@app/repository/definition/match-schema.interface';

import { GenericRepository } from './generic.repository';

@Injectable({
	providedIn: 'root',
})
export class MatchRepository extends GenericRepository<MatchSchema> {
	override async findAll<K extends StoreNames<MatchSchema>>(
		storeName: K,
	): Promise<StoreValue<MatchSchema, K>[]> {
		return await super.findAll(storeName).then((items) =>
			items?.map((item) => {
				switch (storeName) {
					case 'match_player':
						return new MatchPlayer(item as MatchPlayer);
					case 'match_event':
						return new MatchEvent(item as MatchEvent);
					default:
						return new Match(item as Match);
				}
			}),
		);
	}
}
