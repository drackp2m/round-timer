import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'elapsedTime',
	standalone: true,
})
export class ElapsedTimePipe implements PipeTransform {
	transform(ms: number, decimals = 2): string {
		const [milliseconds, extraSecond] = this.getMillisecondsAndExtraSecond(ms, decimals);
		const seconds = Math.floor(((ms + extraSecond * 1000) / 1000) % 60);
		const minutes = Math.floor(((ms + extraSecond * 1000) / (1000 * 60)) % 60);
		const hours = Math.floor((ms + extraSecond * 1000) / (1000 * 60 * 60));

		const secondsFormatted = seconds + (0 < decimals ? `.${milliseconds}` : '');

		const parts: string[] = [];

		if (0 < hours) {
			parts.push(`${hours}h`);
		}

		if (0 < minutes || 0 < hours) {
			parts.push(`${minutes.toString()}m`);
		}

		parts.push(`${secondsFormatted}s`);

		return parts.join(' ');
	}

	private getMillisecondsAndExtraSecond(ms: number, decimals: number): [string, number] {
		// FixMe => when ms is `59477` and decimals is `0` should return `60`
		let milliseconds = Math.round((ms % 1000) / Math.pow(10, 3 - decimals)).toString();
		const extraSeconds = this.isExtraSecondNeeded(milliseconds, decimals) ? 1 : 0;

		switch (decimals) {
			case 1:
				milliseconds = '10' === milliseconds ? '0' : milliseconds.toString();
				break;
			case 2:
				milliseconds = '100' === milliseconds ? '00' : milliseconds.toString().padStart(2, '0');
				break;
			default:
				milliseconds = milliseconds.toString().padStart(3, '0');
		}

		return [milliseconds, extraSeconds];
	}

	private isExtraSecondNeeded(milliseconds: string, decimals: number): boolean {
		switch (decimals) {
			case 0:
				console.log(milliseconds);

				return '1' === milliseconds;
			case 1:
				return '10' === milliseconds;
			case 2:
				return '100' === milliseconds;
			default:
				return false;
		}
	}
}
