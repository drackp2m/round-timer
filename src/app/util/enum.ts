import { EnumSelectOptions } from '@app/definition/enum-select-options.type';
import { ChangeTextCase } from '@app/util/change-text-case';

export abstract class Enum {
	static toSelectOptions<T extends Record<string, string | number>>(
		enumObj: T,
	): EnumSelectOptions<T> {
		return Object.keys(enumObj).map((key) => ({
			value: key as keyof T,
			name: ChangeTextCase.fromUpperCaseToSentenceCase(key),
		}));
	}
}
