import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'shortenUuid',
})
export class ShortenUuidPipe implements PipeTransform {
	transform(uuid: string, start = 8, end = 6, ellipsis = '…'): string {
		if (uuid.length <= start + end + ellipsis.length) {
			return uuid;
		}

		return `${uuid.slice(0, start)}${ellipsis}${uuid.slice(-end)}`;
	}
}
