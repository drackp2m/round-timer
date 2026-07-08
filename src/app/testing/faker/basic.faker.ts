import { faker } from '@faker-js/faker';

/**
 * Picks a random *key* of a string enum. Models store the enum key (e.g.
 * `turnType: 'EQUITABLE'`), not the value, so factories generate keys.
 */
export function randomEnumKey<T extends Record<string, string>>(enumObject: T): keyof T {
	return faker.helpers.arrayElement(Object.keys(enumObject));
}
