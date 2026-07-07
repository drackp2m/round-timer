import { Game } from '@app/model/game.model';
import { MatchEvent } from '@app/model/match-event.model';
import { MatchPlayer } from '@app/model/match-player.model';
import { Match } from '@app/model/match.model';
import { Player } from '@app/model/player.model';
import { Setting } from '@app/model/setting.model';

/** Strips class methods, keeping only the plain data fields of `T`. */
type DataOnly<T> = Pick<
	T,
	{ [K in keyof T]: T[K] extends (...args: never[]) => unknown ? never : K }[keyof T]
>;

export type SerializedUpdatable<T> = Omit<DataOnly<T>, 'createdAt' | 'updatedAt'> & {
	createdAt: string;
	updatedAt: string;
};

export type SerializedBase<T> = Omit<DataOnly<T>, 'createdAt'> & {
	createdAt: string;
};

export interface BackupFile {
	version: number;
	exportedAt: string;
	players: SerializedUpdatable<Player>[] | undefined;
	games: SerializedUpdatable<Game>[] | undefined;
	settings: SerializedUpdatable<Setting>[] | undefined;
	matches: SerializedUpdatable<Match>[] | undefined;
	matchPlayers: SerializedUpdatable<MatchPlayer>[] | undefined;
	matchEvents: SerializedBase<MatchEvent>[] | undefined;
}
