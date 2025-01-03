import {
	DBSchema,
	IDBPDatabase,
	IDBPTransaction,
	IndexKey,
	IndexNames,
	StoreKey,
	StoreNames,
	StoreValue,
	openDB,
} from 'idb';

import { Repository } from '@app/util/repository';

export class GenericRepository<T extends DBSchema> {
	private dbName = 'RoundTimer';
	private dbPromise = this.getDbPromise();
	private transaction: IDBPTransaction<T, StoreNames<T>[], 'readwrite' | 'readonly'> | null = null;

	async beginTransaction(storeNames: StoreNames<T>[]): Promise<void> {
		const db = await this.dbPromise;
		this.transaction = db.transaction(storeNames, 'readwrite');
	}

	async commitTransaction(): Promise<void> {
		if (null !== this.transaction) {
			await this.transaction.done;
			this.transaction = null;
		}
	}

	async insert<K extends StoreNames<T>>(
		storeName: K,
		value: StoreValue<T, K>,
	): Promise<StoreValue<T, K>> {
		return this.withTransaction([storeName], 'readwrite', async (tx) => {
			try {
				await tx.objectStore(storeName).put(value);

				return value;
			} catch (error) {
				return Promise.reject(
					`Error inserting data in \`${storeName}\`: ${JSON.stringify(value)}\n${error}`,
				);
			}
		});
	}

	// ToDo => try transform plain data to model
	async find<K extends StoreNames<T>>(
		storeName: K,
		key: StoreKey<T, K>,
	): Promise<StoreValue<T, K> | undefined> {
		return this.withTransaction([storeName], 'readonly', async (tx) => {
			return tx.objectStore(storeName).get(key);
		});
	}

	async findAll<K extends StoreNames<T>>(storeName: K): Promise<StoreValue<T, K>[]> {
		return this.withTransaction([storeName], 'readonly', async (tx) => {
			return tx.objectStore(storeName).getAll();
		});
	}

	async findByIndex<K extends StoreNames<T>>(
		storeName: K,
		indexName: IndexNames<T, K>,
		indexValue: IDBKeyRange | IndexKey<T, K, IndexNames<T, K>>,
	): Promise<StoreValue<T, K>[]> {
		return this.withTransaction([storeName], 'readonly', async (tx) => {
			return tx.objectStore(storeName).index(indexName).getAll(indexValue);
		});
	}

	async delete<K extends StoreNames<T>>(storeName: K, key: StoreValue<T, K>): Promise<void> {
		await this.withTransaction([storeName], 'readwrite', async (tx) => {
			await tx.objectStore(storeName).delete(key);
		});
	}

	async clear<K extends StoreNames<T>>(storeName: K): Promise<void> {
		await this.withTransaction([storeName], 'readwrite', async (tx) => {
			await tx.objectStore(storeName).clear();
		});
	}

	private async withTransaction<R, M extends 'readonly' | 'readwrite'>(
		storeNames: StoreNames<T>[],
		mode: M,
		operation: (tx: IDBPTransaction<T, StoreNames<T>[], M>) => Promise<R>,
	): Promise<R> {
		const tx = (this.transaction ??
			(await this.dbPromise).transaction(storeNames, mode)) as IDBPTransaction<
			T,
			StoreNames<T>[],
			M
		>;

		const result = await operation(tx);
		if (null === this.transaction) {
			await tx.done;
		}

		return result;
	}

	private getDbPromise(): Promise<IDBPDatabase<T>> {
		return openDB<T>(this.dbName, Repository.getLatestVersion(), {
			upgrade: (db, oldVersion, newVersion, transaction) => {
				Repository.applyMigrations(db, oldVersion, newVersion, transaction);
			},
		});
	}
}
