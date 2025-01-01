export class Match {
	private readonly NOW = new Date();

	// FixMe => this is unsafe
	readonly uuid: string = crypto.randomUUID();
	readonly name?: string;
	readonly gameUuid: string;
	readonly participants: string[];
	readonly createdAt: Date = this.NOW;
	readonly updatedAt: Date = this.NOW;

	// ToDo => fix this
	constructor(model: Omit<Match, 'uuid' | 'createdAt' | 'updatedAt'>) {
		this.name = model.name;
		this.gameUuid = model.gameUuid;
		this.participants = model.participants;
	}
}
