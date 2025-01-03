import { EnumSelectOptions } from '@app/definition/enum-select-options.type';
import { Text } from '@app/util/text';

export abstract class Enum {
	static toSelectOptions<T extends Record<string, string | number>>(
		enumObj: T,
	): EnumSelectOptions<T> {
		return Object.keys(enumObj).map((key) => ({
			value: key as keyof T,
			name: Text.fromUpperCaseToSentenceCase(key),
		}));
	}

	static emptyStringAs<T>(): T {
		return '' as T;
	}
}
