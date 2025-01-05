import { Injectable } from '@angular/core';

import { MatchEvent } from '@app/model/match-event.model';
import { MatchPlayer } from '@app/model/match-player.model';
import { Match } from '@app/model/match.model';
import { MatchSchema } from '@app/repository/definition/match-schema.interface';

import { GenericRepository } from './generic.repository';

@Injectable({
	providedIn: 'root',
})
export class MatchRepository extends GenericRepository<MatchSchema> {
	async findInProgressMatch(): Promise<
		{ match: Match; matchPlayers: MatchPlayer[]; matchEvents: MatchEvent[] } | undefined
	> {
		const match = await this.findByIndex('match', 'status', 'IN_PROGRESS');

		if (undefined === match) {
			return undefined;
		}

		const matchPlayers = await this.findAllByIndex('match_player', 'match_uuid', match.uuid);
		let matchEvents = await this.findAllByIndex('match_event', 'match_uuid', match.uuid);

		matchEvents = matchEvents.sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		);

		return { match: new Match(match), matchPlayers, matchEvents };
	}
}
