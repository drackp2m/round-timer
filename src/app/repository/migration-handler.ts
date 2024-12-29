import { Injectable } from '@angular/core';
import { IDBPDatabase, IDBPTransaction, StoreNames, deleteDB } from 'idb';

import { PlayerSchema } from '@app/definition/player/player.schema';

export type IDBPDatabaseSchemas = PlayerSchema;

interface Migration<T> {
	version: number;
	apply: (props: {
		database: IDBPDatabase<T>;
		oldVersion: number;
		newVersion: number | null;
		transaction: IDBPTransaction<T, StoreNames<T>[], 'versionchange'>;
	}) => void;
}

@Injectable({
	providedIn: 'root',
})
export class MigrationHandler<T> {
	private readonly deprecatedDatabaseNames: string[] = [];

	private migrations: Migration<IDBPDatabaseSchemas>[] = [
		{
			version: 1,
			apply: ({ database }) => {
				database.createObjectStore('player');
			},
		},
		{
			version: 2,
			apply: ({ oldVersion, transaction }) => {
				if (2 > oldVersion) {
					const offlineGameStore = transaction.objectStore('player');
					offlineGameStore.createIndex('nick', 'nick', { unique: true });
				}
			},
		},
	];

	getLatestVersion(): number {
		return this.migrations.length;
	}

	applyMigrations(
		database: IDBPDatabase<T>,
		oldVersion: number,
		newVersion: number | null,
		transaction: IDBPTransaction<T, StoreNames<T>[], 'versionchange'>,
	): void {
		const migrations = this.migrations as unknown as Migration<T>[];

		for (const migration of migrations) {
			if (migration.version > oldVersion) {
				migration.apply({ database, oldVersion, newVersion, transaction });
			}
		}
	}

	async removeDeprecatedDatabase(): Promise<void> {
		const promises: Promise<void>[] = [];

		if ('databases' in indexedDB) {
			const databases = await indexedDB.databases();
			databases.forEach((database): Promise<void> | void => {
				if (database.name !== undefined && this.deprecatedDatabaseNames.includes(database.name)) {
					const deletePromise = deleteDB(database.name, {
						blocked() {
							console.warn(`Unable to delete DataBase ${database.name}, because it is blocked`);
						},
					});

					promises.push(deletePromise);
				}
			});
		}

		await Promise.all(promises);
	}
}
