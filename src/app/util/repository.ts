import { IDBPDatabase, IDBPTransaction, StoreNames, deleteDB } from 'idb';

import { AppSchema } from '@app/repository/definition/app-schema.interface';
import { Migration } from '@app/repository/definition/migration.interface';
import { createPlayerStoreMigration } from '@app/repository/migration/v1_create-player-store.migration';
import { createPlayerNickIndexMigration } from '@app/repository/migration/v2_create-player-nick-index.migration';
import { createGameStoreMigration } from '@app/repository/migration/v3_create-game-store.migration';
import { createMatchStoresMigration } from '@app/repository/migration/v4_create-match-stores.migration';
import { createSettingStoreMigration } from '@app/repository/migration/v5_create-setting-store.migration';

export abstract class Repository {
	private static readonly deprecatedDatabaseNames: string[] = [];

	private static migrations: Migration<AppSchema>[] = [
		createPlayerStoreMigration,
		createPlayerNickIndexMigration,
		createGameStoreMigration,
		createMatchStoresMigration,
		createSettingStoreMigration,
	];

	static getLatestVersion(): number {
		if (0 === this.migrations.length) {
			throw new Error('No migrations found');
		}

		const versions = this.migrations.map((migration) => migration.version);
		const maxVersion =
			Math.max(...versions) > versions.length ? Math.max(...versions) : versions.length;
		const expectedVersions = Array.from({ length: maxVersion }, (_element, index) => index + 1);

		const missingVersions = expectedVersions.filter((version) => !versions.includes(version));

		if (0 < missingVersions.length) {
			throw new Error(
				`Missing migrations for versions [${missingVersions.join(', ')}]. Please make sure that all versions are covered.`,
			);
		}

		return maxVersion;
	}

	static applyMigrations<T>(
		database: IDBPDatabase<T>,
		oldVersion: number,
		newVersion: number | null,
		transaction: IDBPTransaction<T, StoreNames<T>[], 'versionchange'>,
	): void {
		const migrations = this.migrations as unknown as Migration<T>[];

		console.log('Applying IndexedDB migrations:');

		for (const migration of migrations) {
			if (migration.version > oldVersion) {
				console.log(`Updating to version ${migration.version}: ${migration.description}...`);

				migration.apply({ database, oldVersion, newVersion, transaction });
			}
		}
	}

	static async removeDeprecatedDatabase(): Promise<void> {
		const promises: Promise<void>[] = [];

		if ('databases' in indexedDB) {
			const databases = await indexedDB.databases();

			databases.forEach((database): void => {
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
