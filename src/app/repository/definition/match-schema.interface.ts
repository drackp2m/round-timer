import { DBSchema } from 'idb';

import { MatchEvent } from '@app/model/match-event.model';
import { MatchPlayer } from '@app/model/match-player.model';
import { Match } from '@app/model/match.model';

export interface MatchSchema extends DBSchema {
	match: {
		key: string;
		value: Match;
	};
	match_player: {
		key: string;
		value: MatchPlayer;
		indexes: { match_uuid: string; user_uuid: string };
	};
	match_event: {
		key: string;
		value: MatchEvent;
		indexes: { match_uuid: string };
	};
}
