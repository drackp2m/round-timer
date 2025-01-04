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
	private readonly turns: MatchTurn[] = [];
	private currentTurnOrder: string[] = [];
	private currentTurn = 0;
	private lastRelevantDate = new Date();

	execute(events: MatchEvent[]) {
		for (const event of events) {
			console.log(`Checking event ${event.type}...`);

			if (Check.isEventType(event, 'SET_TURN_ORDER')) {
				this.currentTurnOrder = event.payload;
				continue;
			}

			switch (event.type) {
				case 'NEXT_TURN':
					this.dispatchNextTurnEvent(event);
					break;
				case 'PAUSE':
					this.dispatchPauseEvent(event);
					break;
			}
		}

		return this.turns;
	}

	private dispatchNextTurnEvent(event: MatchEvent): void {
		if (0 === this.currentTurn) {
			console.log('First turn');

			this.lastRelevantDate = new Date(event.createdAt);
			this.currentTurn++;

			return;
		}

		const currentDate = new Date();

		this.addTimeToCurrentTurn(currentDate);

		this.lastRelevantDate = currentDate;
		this.currentTurn++;
	}

	private dispatchPauseEvent(event: MatchEvent): void {
		const currentDate = new Date(event.createdAt);

		this.addTimeToCurrentTurn(currentDate);

		this.lastRelevantDate = currentDate;
		this.currentTurn++;
	}

	private dispatchEventResume(): void {
		this.lastRelevantDate = new Date();
	}

	private getCurrentPlayerUuid(): string {
		return this.currentTurnOrder[this.currentTurn % this.currentTurnOrder.length] ?? '';
	}

	private addTimeToCurrentTurn(currentDate: Date): void {
		const time = currentDate.getTime() - this.lastRelevantDate.getTime();

		const currentTurn = this.turns[this.currentTurn];

		if (currentTurn !== undefined) {
			currentTurn.time += time;
		} else {
			const currentPlayerUuid = this.getCurrentPlayerUuid();

			console.log(time);

			this.turns.push({ playerUuid: currentPlayerUuid, time });
		}
	}
}
