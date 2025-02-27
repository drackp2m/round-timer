import { Generate } from '@app/util/generate';

export abstract class Game {
	private static readonly games = [
		'Carcassonne',
		'Puerto Rico',
		'Agricola',
		'Catan',
		'Ticket to Ride',
		'Dominion',
		'Power Grid',
		'7 Wonders',
		'Terra Mystica',
		'Wingspan',
		'Viticulture',
		'Splendor',
		'Concordia',
		'Terraforming Mars',
		'Castles of Burgundy',
		'Brass: Birmingham',
		'Scythe',
		'Root',
		'Azul',
		'Everdell',
		'Ark Nova',
		'Great Western Trail',
		'Orleans',
		'Maracaibo',
		'Descent',
		'Tigris & Euphrates',
		'Clans of Caledonia',
		'Anachrony',
		'Gaia Project',
		'Le Havre',
		'Fields of Arle',
		'Paladins of the West Kingdom',
		'Architects of the West Kingdom',
		'The Witcher: Old World',
		'Raiders of the North Sea',
		'The Gallerist',
		'Lisboa',
		'Kanban EV',
		'Barrage',
		'Teotihuacan',
		"Tzolk'in: The Mayan Calendar",
		'Coimbra',
		'Keyflower',
		'Carpe Diem',
		'Pandemic',
		'Twilight Struggle',
		'Gloomhaven',
		'Mage Knight',
		'Eclipse: Second Dawn for the Galaxy',
		'A Feast for Odin',
		'Robinson Crusoe',
		'Lord of the Rings: Journeys in Middle-earth',
		'Cthulhu: Death May Die',
		'Spirit Island',
		'Keep the Heroes Out',
		'Nemesis',
		'Arkham Horror: The Card Game',
		'Eldritch Horror',
		"Betrayal at Baldur's Gate",
		'Dune: Imperium',
		'Lost Ruins of Arnak',
		'Chronicles of Crime',
		'Unmatched',
		'Kingdomino',
		'Tichu',
	];

	static getRandomName(): string {
		const random = Generate.randomNumber(0, this.games.length - 1);

		return this.games[random] ?? '';
	}
}
