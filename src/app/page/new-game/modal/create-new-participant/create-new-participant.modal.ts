import { Component } from '@angular/core';

import { participantColor } from '../../../../definition/participant/participant-color.enum';
import { ParticipantIcon } from '../../../../definition/participant/participant-icon.enum';
import { InputDirective } from '../../../../directive/input.directive';
import { SelectDirective } from '../../../../directive/select.directive';
import { ChangeTextCase } from '../../../../util/change-text-case';

@Component({
	templateUrl: './create-new-participant.modal.html',
	styleUrl: './create-new-participant.modal.scss',
	imports: [InputDirective, SelectDirective],
})
export class CreateNewParticipantModal {
	readonly colorValues = Object.values(participantColor);
	readonly colors = this.getColorNames();
	readonly icons = this.getIconNames();

	private getColorNames(): string[] {
		return Object.keys(participantColor).map(ChangeTextCase.fromUpperCaseToTitleCase);
	}

	private getIconNames(): string[] {
		return Object.keys(ParticipantIcon).map(ChangeTextCase.fromUpperCaseToTitleCase);
	}
}
