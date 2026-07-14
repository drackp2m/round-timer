import { Injectable, computed } from '@angular/core';
import { patchState, signalStore, withState } from '@ngrx/signals';

export interface SelectOptionViewModel {
	value: string;
	label: string;
	disabled: boolean;
	selected: boolean;
	highlighted: boolean;
}

interface SelectStoreProps {
	options: SelectOptionViewModel[];
	highlightedIndex: number | null;
	searchText: string;
	selectedText: string;
	isOpen: boolean;
	focused: boolean;
	filled: boolean;
	disabled: boolean;
}

const initialState: SelectStoreProps = {
	options: [],
	highlightedIndex: null,
	searchText: '',
	selectedText: '',
	isOpen: false,
	focused: false,
	filled: false,
	disabled: false,
};

/**
 * Single source of truth for one select's reactive UI state: the option
 * list, the open/focused/filled flags, the search text and the highlight.
 * Provided per directive instance; the shell component reads it directly.
 */
@Injectable()
export class SelectStore extends signalStore({ protectedState: false }, withState(initialState)) {
	readonly visibleOptions = computed<SelectOptionViewModel[]>(() => {
		const search = this.searchText().trim().toLowerCase();
		const highlightedIndex = this.highlightedIndex();

		return this.options()
			.filter((option) => '' === search || option.label.toLowerCase().includes(search))
			.map((option, index) => ({ ...option, highlighted: index === highlightedIndex }));
	});

	setOptionsFromSelect(selectElement: HTMLSelectElement): void {
		const options: SelectOptionViewModel[] = Array.from(selectElement.options).map((option) => ({
			value: option.value,
			label: option.text,
			disabled: option.disabled,
			selected: option.value === selectElement.value,
			highlighted: false,
		}));

		patchState(this, { options });
	}

	updateSelection(value: string, selectedText: string): void {
		patchState(this, {
			selectedText,
			filled: '' !== value,
			options: this.options().map((option) => ({ ...option, selected: option.value === value })),
		});
	}

	setFocused(focused: boolean): void {
		patchState(this, { focused });
	}

	setDisabled(disabled: boolean): void {
		patchState(this, { disabled });
	}

	openDropdown(): void {
		patchState(this, { isOpen: true });
		this.highlightInitialOption();
	}

	closeDropdown(): void {
		patchState(this, { isOpen: false, highlightedIndex: null, searchText: '' });
	}

	moveHighlight(step: 1 | -1): void {
		const visible = this.visibleOptions();
		const start = (this.highlightedIndex() ?? (1 === step ? -1 : visible.length)) + step;

		for (let index = start; 0 <= index && index < visible.length; index += step) {
			const option = visible[index];

			if (undefined !== option && !option.disabled) {
				this.highlightAt(index);

				return;
			}
		}
	}

	highlightFirstValidOption(): void {
		const index = this.visibleOptions().findIndex(
			(option) => '' !== option.value && !option.disabled,
		);

		this.highlightAt(index);
	}

	highlightAt(index: number): void {
		patchState(this, { highlightedIndex: -1 === index ? null : index });
	}

	clearHighlight(): void {
		patchState(this, { highlightedIndex: null });
	}

	confirmHighlightedOption(): SelectOptionViewModel | null {
		const highlighted = this.visibleOptions()[this.highlightedIndex() ?? -1];

		if (undefined === highlighted || highlighted.disabled) {
			return null;
		}

		return highlighted;
	}

	setSearchText(searchText: string): void {
		patchState(this, { searchText });
		this.highlightFirstMatch();
	}

	private highlightInitialOption(): void {
		const visible = this.visibleOptions();
		const selectedIndex = visible.findIndex((option) => option.selected && !option.disabled);
		const fallbackIndex = visible.findIndex((option) => !option.disabled);

		this.highlightAt(-1 !== selectedIndex ? selectedIndex : fallbackIndex);
	}

	private highlightFirstMatch(): void {
		const index = this.visibleOptions().findIndex((option) => !option.disabled);

		this.highlightAt(index);
	}
}
