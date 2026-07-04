import { Game } from '@app/model/game.model';
import { Player } from '@app/model/player.model';

export type SerializedRecord<T> = Omit<T, 'createdAt' | 'updatedAt'> & {
	createdAt: string;
	updatedAt: string;
};

export interface BackupFile {
	version: 1;
	exportedAt: string;
	players: SerializedRecord<Player>[];
	games: SerializedRecord<Game>[];
}
