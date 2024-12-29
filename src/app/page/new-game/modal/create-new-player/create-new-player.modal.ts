import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnumSelectOptions } from '@app/definition/enum-select-options';

import { PlayerColor } from '@app/definition/player/player-color.enum';
import { PlayerIcon } from '@app/definition/player/player-icon.enum';
import { Player } from '@app/definition/player/player.model';
import { ButtonDirective } from '@app/directive/button.directive';
import { InputDirective } from '@app/directive/input.directive';
import { SelectDirective } from '@app/directive/select.directive';
import { PlayerStore } from '@app/store/player.store';
import { ChangeTextCase } from '@app/util/change-text-case';
import { Enum } from '@app/util/enum';

@Component({
	templateUrl: './create-new-player.modal.html',
	styleUrl: './create-new-player.modal.scss',
	imports: [InputDirective, SelectDirective, ReactiveFormsModule, ButtonDirective],
})
export class CreateNewPlayerModal {
	private readonly playerStore = inject(PlayerStore);

	readonly colorValues = Object.values(PlayerColor);
	readonly colors = this.getColorNames();
	readonly icons = this.getIconNames();

	readonly playerForm = new FormGroup({
		name: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required, Validators.minLength(3)],
		}),
		nick: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required, Validators.minLength(4), Validators.maxLength(20)],
		}),
		color: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
		icon: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
	});

	onSubmit(): void {
		if (this.playerForm.valid) {
			const player = this.createPlayerFromForm();

			this.playerStore.addPlayer(player);
		}
	}

	private getColorNames(): EnumSelectOptions<typeof PlayerColor> {
		return Enum.toSelectOptions(PlayerColor);
	}

	private getIconNames(): EnumSelectOptions<typeof PlayerIcon> {
		return Enum.toSelectOptions(PlayerIcon);
	}

	private createPlayerFromForm(): Player {
		const controls = this.playerForm.controls;

		return new Player(
			controls.name.value,
			controls.nick.value,
			controls.color.value,
			controls.icon.value,
		);
	}
}
