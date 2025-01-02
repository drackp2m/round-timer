const omittedKeys = ['computed', 'omittedKeys'];

export abstract class RepositoryModel<T> {
	forRepository(): T {
		return Object.keys(this).reduce<Record<string, unknown>>((acc, key) => {
			if (!omittedKeys.includes(key)) {
				acc[key] = this[key as keyof this];
			}

			return acc;
		}, {}) as T;
	}

	static fromRepository<M extends RepositoryModel<T>, T>(
		this: new (model: unknown) => M,
		data: T,
	): M {
		return new this(data);
	}
}
