import { Component, ElementRef, computed, effect, inject, input, viewChild } from '@angular/core';

import { SvgComponent } from '@app/component/svg.component';
import { MatchTurn } from '@app/definition/page/match/match-turn.interface';
import { PlayerStore } from '@app/store/player.store';
import { Async } from '@app/util/async';

import { ShowMillisecondsPipe } from 'src/app/pipe/show-milliseconds.pipe';

@Component({
	selector: 'app-match-turns',
	templateUrl: './match-turns.component.html',
	styleUrl: './match-turns.component.scss',
	imports: [ShowMillisecondsPipe, SvgComponent],
})
export class MatchTurnsComponent {
	readonly playersCount = input.required<number>();
	readonly matchTurns = input.required<MatchTurn[], MatchTurn[]>({
		transform: (value) => value.filter((turn) => 0 < turn.time),
	});

	private readonly playerStore = inject(PlayerStore);

	readonly turns = viewChild<ElementRef<HTMLDivElement>>('turns');

	readonly players = this.playerStore.items;
	readonly playerByUuid = computed(
		() => new Map(this.players()?.map((player) => [player.uuid, player])),
	);
	readonly fasterTurn = computed(() =>
		this.matchTurns().reduce(
			(acc, turn, index) => (turn.time < acc.time ? { index, time: turn.time } : acc),
			{ index: 0, time: Number.MAX_SAFE_INTEGER },
		),
	);
	readonly slowerTurn = computed(() =>
		this.matchTurns().reduce(
			(acc, turn, index) => (turn.time > acc.time ? { index, time: turn.time } : acc),
			{ index: 0, time: 0 },
		),
	);

	constructor() {
		effect(() => {
			this.matchTurns();

			const turnsContainer = this.turns()?.nativeElement;

			void Async.waitForFrames(1).then(() => {
				turnsContainer?.scrollTo({
					top: turnsContainer.scrollHeight,
					behavior: 'smooth',
				});
			});
		});
	}
}
