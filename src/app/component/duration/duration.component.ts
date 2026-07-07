import { Component, computed, inject, input } from '@angular/core';

import { DurationPartsPipe } from '@app/pipe/duration-parts.pipe';

@Component({
	selector: 'app-duration',
	templateUrl: './duration.component.html',
	providers: [DurationPartsPipe],
})
export class DurationComponent {
	readonly time = input.required<number>();
	readonly decimals = input(2);

	private readonly durationPartsPipe = inject(DurationPartsPipe);

	readonly parts = computed(() => {
		const time = this.time();
		const decimals = this.decimals();

		return this.durationPartsPipe.transform(time, decimals);
	});

	readonly seconds = computed(() => {
		const parts = this.parts();
		const decimals = this.decimals();

		return (parts[1] ?? '') + (0 === decimals ? 's' : '');
	});

	readonly milliseconds = computed(() => {
		const parts = this.parts();
		const decimals = this.decimals();

		return 0 !== decimals ? '.' + (parts[0] ?? '') + 's' : '';
	});
}
