import { Injectable } from '@angular/core';

import { MatchEvent } from '@app/model/match-event.model';
import { Check } from '@app/util/check';

import { ElapsedTimePipe } from 'src/app/pipe/elapsed-time.pipe';

interface MatchTurn {
	playerUuid: string;
	time: number;
}

@Injectable({
	providedIn: 'root',
})
export class CalculateMatchTurns {
	private turns: MatchTurn[] = [];
	private currentTurnOrder: string[] = [];
	private currentTurn = 0;
	private previousEventDate = new Date();

	execute(events: MatchEvent[]) {
		this.turns = [];
		this.currentTurnOrder = [];
		this.currentTurn = 0;
		this.previousEventDate = new Date();

		for (const [key, event] of events.entries()) {
			console.log(`Checking event #${key} ${event.type}...`);

			if (Check.isEventType(event, 'SET_TURN_ORDER')) {
				this.previousEventDate = new Date(event.createdAt);
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
				case 'RESUME':
					this.dispatchResumeEvent();
					break;
			}

			this.previousEventDate = new Date(event.createdAt);
		}

		return this.turns;
	}

	private dispatchNextTurnEvent(event: MatchEvent): void {
		if (0 === this.currentTurn) {
			console.log('First turn');

			this.currentTurn++;

			return;
		}

		// ToDo => get date from previous event
		const currentEventDate = new Date(event.createdAt);

		this.addTimeToCurrentTurn(currentEventDate);

		this.currentTurn++;
	}

	private dispatchPauseEvent(event: MatchEvent): void {
		const currentEventDate = new Date(event.createdAt);

		this.addTimeToCurrentTurn(currentEventDate);
	}

	private dispatchResumeEvent(): void {
		console.log('Resuming...');
	}

	private getCurrentPlayerUuid(): string {
		return this.currentTurnOrder[this.currentTurn % this.currentTurnOrder.length] ?? '';
	}

	private addTimeToCurrentTurn(lastEventDate: Date): void {
		const pipe = new ElapsedTimePipe();
		const time = lastEventDate.getTime() - this.previousEventDate.getTime();

		console.log({ turn: this.currentTurn, time: pipe.transform(time) });

		const currentTurn = this.turns[this.currentTurn - 1];

		if (currentTurn !== undefined) {
			currentTurn.time += time;
		} else {
			const currentPlayerUuid = this.getCurrentPlayerUuid();

			this.turns.push({ playerUuid: currentPlayerUuid, time });
		}
	}
}
