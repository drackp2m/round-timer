/**
 * Minimal test-data factory. `definition()` supplies faker-generated defaults
 * for every field; `build()` turns a full prop set into the model instance.
 * Callers get one or many instances and can override any field per call, with
 * overrides winning over the generated defaults. Mirrors the faker/factory split
 * from the reference repo, adapted to plain Angular models (no ORM seeder).
 */
export abstract class Factory<TModel, TProps extends object> {
	makeOne(overrides: Partial<TProps> = {}): TModel {
		return this.build({ ...this.definition(), ...overrides });
	}

	make(quantity: number, overrides: Partial<TProps> = {}): TModel[] {
		return Array.from({ length: quantity }, () => this.makeOne(overrides));
	}

	protected abstract definition(): TProps;

	protected abstract build(props: TProps): TModel;
}
