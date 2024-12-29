export class Player {
	readonly uuid: string;
	readonly name: string;
	readonly nick: string;
	readonly color: string;
	readonly icon: string;
	readonly createdAt: Date;
	readonly updateAt: Date;

	constructor(name: string, nick: string, color: string, icon: string) {
		this.uuid = crypto.randomUUID();
		this.name = name;
		this.nick = nick;
		this.color = color;
		this.icon = icon;
		this.createdAt = new Date();
		this.updateAt = new Date();
	}
}
