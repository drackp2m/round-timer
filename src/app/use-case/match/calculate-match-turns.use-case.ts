import { Injectable } from '@angular/core';

import { MatchEvent } from '@app/model/match-event.model';
import { Check } from '@app/util/check';

interface MatchTurn {
	playerUuid: string;
	time: number;
}

@Injectable({
	providedIn: 'root',
})
export class CalculateMatchTurns {
	private events!: MatchEvent[];
	private eventCheckingIndex!: number;
	private turns!: MatchTurn[];
	private turnOrder!: string[];
	private currentTurn!: number;

	execute(events: MatchEvent[]) {
		this.events = events;
		this.turns = [];
		this.turnOrder = [];
		this.currentTurn = -1;

		for (const [index, event] of events.entries()) {
			this.eventCheckingIndex = index;
			console.log(`Checking event #${index} ${event.type}...`);

			if (Check.isEventType(event, 'SET_TURN_ORDER')) {
				this.turnOrder = event.payload;
				continue;
			}

			switch (event.type) {
				case 'NEXT_TURN':
					this.dispatchNextTurnEvent();
					break;
				case 'PAUSE':
					this.dispatchPauseEvent();
					break;
			}
		}

		return this.turns;
	}

	private dispatchNextTurnEvent(): void {
		this.currentTurn++;

		const currentTurn = this.turns[this.currentTurn];

		if (currentTurn === undefined) {
			const currentPlayerUuid = this.getCurrentPlayerUuid();

			this.turns.push({ playerUuid: currentPlayerUuid, time: 0 });
		}

		if (0 !== this.currentTurn) {
			this.addTimeToCurrentTurn();
		}
	}

	private dispatchPauseEvent(): void {
		this.addTimeToCurrentTurn(false);
	}

	private getCurrentPlayerUuid(): string {
		return this.turnOrder[this.currentTurn % this.turnOrder.length] ?? '';
	}

	private addTimeToCurrentTurn(isNextEvent = true): void {
		const currentEventDate = new Date(this.events[this.eventCheckingIndex]?.createdAt ?? 0);
		const previousEventDate = new Date(this.events[this.eventCheckingIndex - 1]?.createdAt ?? 0);
		const time = currentEventDate.getTime() - previousEventDate.getTime();

		const currentEventType = this.events[this.eventCheckingIndex]?.type;
		const previousEventType = this.events[this.eventCheckingIndex - 1]?.type;

		const currentTurn = this.turns[this.currentTurn - (isNextEvent ? 1 : 0)];

		if (
			currentTurn !== undefined &&
			!('PAUSE' === previousEventType && 'NEXT_TURN' === currentEventType)
		) {
			currentTurn.time += time;
		}
	}
}
