import { DBSchema } from 'idb';

import { Participant } from './participant.model';

export interface ParticipantSchema extends DBSchema {
	participant: {
		key: string;
		value: Participant;
		indexes: { nick: string };
	};
}
