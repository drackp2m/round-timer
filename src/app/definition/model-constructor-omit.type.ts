export type ModelConstructorOmit<T> = Omit<
	T,
	'uuid' | 'status' | 'createdAt' | 'updatedAt' | 'computed' | 'forRepository'
>;
