import { Directive, input } from '@angular/core';

import { Check } from '@app/util/check';

@Directive({
	selector: '[appSquared]',
	host: {
		'[class.squared]': 'squared()',
	},
})
export class SquaredDirective {
	readonly squared = input(false, { transform: Check.isFalseAsStringOrTrue });
}
