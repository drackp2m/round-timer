import { Component, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Player } from '@app/model/player.model';

import { PlayerBadgeComponent } from '@app/component/player-badge.component';
import { EnumSelectOptions } from '@app/definition/enum-select-options.type';
import { PlayerColor } from '@app/definition/player/player-color.enum';
import { PlayerIcon } from '@app/definition/player/player-icon.enum';
import { ButtonDirective } from '@app/directive/button.directive';
import { InputDirective } from '@app/directive/input.directive';
import { SelectDirective } from '@app/directive/select.directive';
import { PlayerStore } from '@app/store/player.store';
import { Enum } from '@app/util/enum';

@Component({
	templateUrl: './create-new-player.modal.html',
	styleUrl: './create-new-player.modal.scss',
	imports: [
		InputDirective,
		SelectDirective,
		ReactiveFormsModule,
		ButtonDirective,
		PlayerBadgeComponent,
	],
})
export class CreateNewPlayerModal {
	private readonly playerStore = inject(PlayerStore);

	readonly colorValues = Object.values(PlayerColor);
	readonly colors = this.getColorNames();
	readonly icons = this.getIconNames();

	readonly playerForm = new FormGroup({
		name: new FormControl<string>('', {
			nonNullable: true,
			validators: [Validators.required, Validators.minLength(3)],
		}),
		nick: new FormControl<string>('', {
			nonNullable: true,
			validators: [Validators.required, Validators.minLength(4), Validators.maxLength(20)],
		}),
		color: new FormControl<keyof typeof PlayerColor | ''>('', {
			nonNullable: true,
			validators: [Validators.required],
		}),
		icon: new FormControl<keyof typeof PlayerIcon | ''>('', {
			nonNullable: true,
			validators: [Validators.required],
		}),
	});

	private readonly formChange = toSignal(this.playerForm.valueChanges);

	partialPlayer: Signal<Partial<Player>> = computed(() => {
		this.formChange();

		return this.partialPlayerFromForm();
	});

	player: Signal<Player | null> = computed(() => {
		this.formChange();

		return this.playerFromForm();
	});

	onSubmit(): void {
		const player = this.player();

		if (this.playerForm.invalid || null === player) {
			return;
		}

		this.playerStore.addPlayer(player);
	}

	private getColorNames(): EnumSelectOptions<typeof PlayerColor> {
		return Enum.toSelectOptions(PlayerColor);
	}

	private getIconNames(): EnumSelectOptions<typeof PlayerIcon> {
		return Enum.toSelectOptions(PlayerIcon);
	}

	private playerFromForm(): Player | null {
		const { name, nick, color, icon } = this.playerForm.controls;

		if ('' === color.value || '' === icon.value) {
			return null;
		}

		return new Player(name.value, nick.value, color.value, icon.value);
	}

	private partialPlayerFromForm(): Partial<Player> {
		const { name, nick, color, icon } = this.playerForm.controls;

		return {
			name: name.value,
			nick: nick.value,
			color: '' !== color.value ? color.value : undefined,
			icon: '' !== icon.value ? icon.value : undefined,
		};
	}
}
