import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, input, output } from '@angular/core';

import { SvgComponent } from '@app/component/svg.component';
import { SelectOptionViewModel } from '@app/directive/select/select-option.model';

export interface SelectShellViewModel {
	label: string;
	selectId: string;
	selectedText: string;
	searchText: string;
	isSearching: boolean;
	isOpen: boolean;
	positionTop: boolean;
	focused: boolean;
	filled: boolean;
	options: SelectOptionViewModel[];
	optionTemplate: TemplateRef<{ $implicit: SelectOptionViewModel }> | undefined;
}

@Component({
	selector: 'app-select-shell',
	templateUrl: './select-shell.component.html',
	imports: [SvgComponent, NgTemplateOutlet],
})
export class SelectShellComponent {
	readonly viewModel = input.required<SelectShellViewModel>();

	readonly optionSelected = output<string>();
	readonly optionHovered = output<number>();

	selectOption(option: SelectOptionViewModel): void {
		if (!option.disabled) {
			this.optionSelected.emit(option.value);
		}
	}

	hoverOption(option: SelectOptionViewModel, index: number): void {
		if (!option.disabled) {
			this.optionHovered.emit(index);
		}
	}
}
