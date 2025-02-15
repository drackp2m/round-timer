import { Component, computed, inject, input } from '@angular/core';

import { ShowMillisecondsPipe } from '@app/pipe/show-milliseconds.pipe';

@Component({
	selector: 'app-show-milliseconds',
	templateUrl: './show-milliseconds.component.html',
	providers: [ShowMillisecondsPipe],
})
export class ShowMillisecondsComponent {
	readonly time = input.required<number>();
	readonly decimals = input(2);

	private readonly showMillisecondsPipe = inject(ShowMillisecondsPipe);

	readonly parts = computed(() => {
		const time = this.time();
		const decimals = this.decimals();

		return this.showMillisecondsPipe.transform(time, decimals);
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
