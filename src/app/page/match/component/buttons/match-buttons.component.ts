import { Component, computed, input, output } from '@angular/core';

import { SvgComponent } from '@app/component/svg.component';
import { MatchEventType } from '@app/definition/model/match/match-event-type.enum';
import { MatchButton } from '@app/definition/page/match/match-button.enum';
import { MatchTurn } from '@app/definition/page/match/match-turn.interface';

@Component({
	selector: 'app-match-buttons',
	templateUrl: './match-buttons.component.html',
	styleUrl: './match-buttons.component.scss',
	imports: [SvgComponent],
})
export class MatchButtonsComponent {
	readonly timerIsRunning = input.required<boolean>();
	readonly matchTurns = input.required<MatchTurn[]>();
	readonly buttonPressed = output<MatchEventType>();

	readonly MatchButton = MatchButton;

	readonly disabledButton = computed(() => this.checkButtonToDisable());

	dispatchButtonPressed(button: MatchButton): void {
		switch (button) {
			case MatchButton.PREVIOUS:
				this.buttonPressed.emit(MatchEventType.PREVIOUS_TURN);
				break;
			case MatchButton.STOP:
				this.buttonPressed.emit(MatchEventType.END);
				break;
			case MatchButton.PLAY_PAUSE:
				this.dispatchPlayPauseButtonPressed();
				break;
			case MatchButton.NEXT:
				this.buttonPressed.emit(MatchEventType.NEXT_TURN);
				break;
		}
	}

	private dispatchPlayPauseButtonPressed(): void {
		const matchTurnsLength = this.matchTurns().length;
		const timerIsRunning = this.timerIsRunning();

		if (0 === matchTurnsLength && !timerIsRunning) {
			this.buttonPressed.emit(MatchEventType.NEXT_TURN);
		} else if (timerIsRunning) {
			this.buttonPressed.emit(MatchEventType.PAUSE);
		} else {
			this.buttonPressed.emit(MatchEventType.RESUME);
		}
	}

	private checkButtonToDisable(): Map<MatchButton, boolean> {
		const matchTurns = this.matchTurns();
		const isTimerRunning = this.timerIsRunning();

		return new Map([
			[MatchButton.PREVIOUS, 1 > matchTurns.length],
			[MatchButton.STOP, 1 > matchTurns.length],
			[MatchButton.PLAY_PAUSE, false],
			[MatchButton.NEXT, 1 > matchTurns.length && !isTimerRunning],
		]);
	}
}
