import {
	SerializedBase,
	SerializedUpdatable,
} from '@app/definition/use-case/backup-file.interface';
import { Game } from '@app/model/game.model';
import { MatchEvent } from '@app/model/match-event.model';
import { MatchPlayer } from '@app/model/match-player.model';
import { Match } from '@app/model/match.model';
import { Player } from '@app/model/player.model';
import { Setting } from '@app/model/setting.model';

export interface RestoreCounters {
	added: number;
	updated: number;
	skipped: number;
}

export interface RestoreSummary {
	players: RestoreCounters;
	games: RestoreCounters;
	settings: RestoreCounters;
	matches: RestoreCounters;
	matchPlayers: RestoreCounters;
	matchEvents: RestoreCounters;
}

/** One record whose business key already exists locally but whose data differs. */
export interface RestoreConflict<T> {
	key: string;
	existing: T;
	incoming: T;
	incomingRaw: SerializedUpdatable<T>;
}

export type RestoreChoice = 'existing' | 'incoming';

/** User decision per conflict, keyed by the existing record's uuid. */
export type RestoreResolutions = Record<string, RestoreChoice>;

export interface EntityAnalysis<T> {
	newItems: SerializedUpdatable<T>[];
	conflicts: RestoreConflict<T>[];
	/** Incoming records that matched an existing one with identical data. */
	identicalCount: number;
	/** Maps each incoming uuid to the canonical uuid that ends up in the database. */
	uuidMap: Map<string, string>;
}

export interface NormalizedBackupFile {
	players: (SerializedUpdatable<Player> & { uuid: string })[];
	games: (SerializedUpdatable<Game> & { uuid: string })[];
	settings: (SerializedUpdatable<Setting> & { uuid: string })[];
	matches: SerializedUpdatable<Match>[];
	matchPlayers: SerializedUpdatable<MatchPlayer>[];
	matchEvents: SerializedBase<MatchEvent>[];
}

export interface RestoreSession {
	players: EntityAnalysis<Player>;
	games: EntityAnalysis<Game>;
	settings: EntityAnalysis<Setting>;
	backup: NormalizedBackupFile;
}
