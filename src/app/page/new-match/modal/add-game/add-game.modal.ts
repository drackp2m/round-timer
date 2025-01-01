import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { GameTurnOrder, GameTurnOrderKey } from '@app/definition/game/game-turn-order.enum';
import { GameTurnType, GameTurnTypeKey } from '@app/definition/game/game-turn-type.enum';
import { ButtonDirective } from '@app/directive/button.directive';
import { InputDirective } from '@app/directive/input.directive';
import { SelectDirective } from '@app/directive/select.directive';
import { Game } from '@app/model/game.model';
import { Modal } from '@app/model/modal.model';
import { GameStore } from '@app/store/game.store';
import { Enum } from '@app/util/enum';
import { Game as GameUtil } from '@app/util/game';

@Component({
	templateUrl: './add-game.modal.html',
	imports: [ReactiveFormsModule, InputDirective, SelectDirective, ButtonDirective],
})
export class AddGameModal extends Modal {
	readonly TITLE = 'Add Game';

	private readonly gameStore = inject(GameStore);

	readonly turnTypes = Enum.toSelectOptions(GameTurnType);
	readonly turnOrders = Enum.toSelectOptions(GameTurnOrder);

	readonly randomGameName = GameUtil.getRandomName();

	readonly form = new FormGroup({
		name: new FormControl<string>('', {
			nonNullable: true,
			validators: [Validators.required, Validators.minLength(3)],
		}),
		maxPlayers: new FormControl<number>(NaN, {
			nonNullable: true,
			validators: [Validators.required, Validators.min(2), Validators.max(20)],
		}),
		turnType: new FormControl<GameTurnTypeKey | ''>('', {
			nonNullable: true,
			validators: [Validators.required],
		}),
		turnOrder: new FormControl<GameTurnOrderKey | ''>('', {
			nonNullable: true,
			validators: [Validators.required],
		}),
	});

	onSubmit(): void {
		const game = new Game(this.form.getRawValue() as Game);

		this.close();
		this.gameStore.addGame(game);
	}
}
