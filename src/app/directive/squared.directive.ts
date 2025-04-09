import { Directive, input } from '@angular/core';

import { Check } from '@app/util/check';

@Directive({
	host: {
		'[class.squared]': 'squared()',
	},
})
export class SquaredDirective {
	readonly squared = input(true, { transform: Check.isFalseAsStringOrTrue });
}
