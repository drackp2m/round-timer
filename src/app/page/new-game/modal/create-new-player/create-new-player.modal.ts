import { Component } from '@angular/core';

import { PlayerColor } from '@app/definition/player/player-color.enum';
import { PlayerIcon } from '@app/definition/player/player-icon.enum';
import { InputDirective } from '@app/directive/input.directive';
import { SelectDirective } from '@app/directive/select.directive';
import { ChangeTextCase } from '@app/util/change-text-case';

@Component({
	templateUrl: './create-new-player.modal.html',
	styleUrl: './create-new-player.modal.scss',
	imports: [InputDirective, SelectDirective],
})
export class CreateNewPlayerModal {
	readonly colorValues = Object.values(PlayerColor);
	readonly colors = this.getColorNames();
	readonly icons = this.getIconNames();

	private getColorNames(): string[] {
		return Object.keys(PlayerColor).map(ChangeTextCase.fromUpperCaseToTitleCase);
	}

	private getIconNames(): string[] {
		return Object.keys(PlayerIcon).map(ChangeTextCase.fromUpperCaseToTitleCase);
	}
}
