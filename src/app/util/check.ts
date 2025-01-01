export abstract class Check {
	static typedValueIsEmpty<T>(value: T | null): boolean {
		return '' === (value as unknown as string) && null !== value;
	}

	static isFalseAsStringOrTrue(value: boolean | string): boolean {
		return 'string' === typeof value ? 'false' !== value : value;
	}
}
