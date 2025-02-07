import { MatchTurn } from '@app/definition/page/match/match-turn.interface';
import { MatchEvent } from '@app/model/match-event.model';
import { Check } from '@app/util/check';

export class CalculateMatchTurns {
	private readonly events: MatchEvent[] = [];
	private readonly turns: MatchTurn[] = [];
	private turnOrder: string[] = [];
	private currentTurn = -1;

	constructor() {
		console.log('CalculateMatchTurns created');
	}

	addEvent(event: MatchEvent) {
		this.events.push(event);

		console.log(`Checking event #${this.events.length.toString()} ${event.type}...`);

		if (Check.isEventType(event, 'SET_TURN_ORDER')) {
			this.turnOrder = event.payload;

			return this.turns;
		}

		switch (event.type) {
			case 'NEXT_TURN':
				this.dispatchNextTurnEvent();
				break;
			case 'PAUSE':
				this.dispatchPauseEvent();
				break;
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
		const currentEventDate = new Date(this.events[this.events.length - 1]?.createdAt ?? 0);
		const previousEventDate = new Date(this.events[this.events.length - 2]?.createdAt ?? 0);
		const time = currentEventDate.getTime() - previousEventDate.getTime();

		const currentEventType = this.events[this.events.length - 1]?.type;
		const previousEventType = this.events[this.events.length - 2]?.type;

		const currentTurn = this.turns[this.currentTurn - (isNextEvent ? 1 : 0)];

		if (
			currentTurn !== undefined &&
			!('PAUSE' === previousEventType && 'NEXT_TURN' === currentEventType)
		) {
			currentTurn.time += time;
		}
	}
}
