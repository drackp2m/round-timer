export type ModelConstructorOmit<T> = Omit<T, 'uuid' | 'createdAt' | 'updatedAt' | 'computed'>;
