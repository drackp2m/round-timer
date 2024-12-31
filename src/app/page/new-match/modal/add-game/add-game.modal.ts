import { AfterViewInit, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { GameTurnOrder, GameTurnOrderKey } from '@app/definition/game/game-turn-order.enum';
import { GameTurnType, GameTurnTypeKey } from '@app/definition/game/game-turn-type.enum';
import { ButtonDirective } from '@app/directive/button.directive';
import { InputDirective } from '@app/directive/input.directive';
import { SelectDirective } from '@app/directive/select.directive';
import { Modal } from '@app/model/modal.model';
import { Enum } from '@app/util/enum';
import { Game } from '@app/util/game';

@Component({
	templateUrl: './add-game.modal.html',
	imports: [ReactiveFormsModule, InputDirective, SelectDirective, ButtonDirective],
})
export class AddGameModal extends Modal {
	readonly TITLE = 'Add Game';

	readonly turnTypes = Enum.toSelectOptions(GameTurnType);
	readonly turnOrders = Enum.toSelectOptions(GameTurnOrder);

	readonly randomGameName = Game.getRandomName();

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
		console.log('submitting...');
	}
}
