import { Component, Signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { PlayerBadgeComponent } from '@app/component/player-badge/player-badge.component';
import { PlayerColor, PlayerColorKey } from '@app/definition/model/player/player-color.enum';
import { PlayerIcon, PlayerIconKey } from '@app/definition/model/player/player-icon.enum';
import { ButtonDirective } from '@app/directive/button.directive';
import { InputDirective } from '@app/directive/input.directive';
import { SelectDirective } from '@app/directive/select.directive';
import { Modal } from '@app/model/modal.model';
import { Player } from '@app/model/player.model';
import { Enum } from '@app/util/enum';

@Component({
	templateUrl: './add-player.modal.html',
	styleUrls: ['./add-player.modal.scss'],
	imports: [
		InputDirective,
		SelectDirective,
		ReactiveFormsModule,
		ButtonDirective,
		PlayerBadgeComponent,
	],
})
export class AddPlayerModal extends Modal<Player> {
	readonly TITLE = 'Add Player';

	readonly colors = Enum.toSelectOptions(PlayerColor);
	readonly icons = Enum.toSelectOptions(PlayerIcon);

	readonly form = new FormGroup({
		name: new FormControl<string>('', {
			nonNullable: true,
			validators: [Validators.required, Validators.minLength(3)],
		}),
		nick: new FormControl<string>('', {
			nonNullable: true,
			validators: [Validators.required, Validators.minLength(4), Validators.maxLength(20)],
		}),
		color: new FormControl<PlayerColorKey>('' as PlayerColorKey, {
			nonNullable: true,
			validators: [Validators.required],
		}),
		icon: new FormControl<PlayerIconKey>('' as PlayerIconKey, {
			nonNullable: true,
			validators: [Validators.required],
		}),
	});

	private readonly formChange = toSignal(this.form.valueChanges);

	player: Signal<Player> = computed(() => {
		this.formChange();

		return this.playerFromForm();
	});

	onSubmit(): void {
		const player = this.player();

		if (this.form.invalid) {
			return;
		}

		this.close(player);
	}

	private playerFromForm(): Player {
		return new Player(this.form.getRawValue() as Player);
	}
}
