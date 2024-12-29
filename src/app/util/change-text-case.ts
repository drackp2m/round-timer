export class ChangeTextCase {
	static fromUpperCaseToTitleCase(upperCaseName: string): string {
		return upperCaseName
			.toLowerCase()
			.split('_')
			.map((word, index) => (0 === index ? word.charAt(0).toUpperCase() + word.slice(1) : word))
			.join(' ');
	}
}
