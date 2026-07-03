import { Injectable, computed } from '@angular/core';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { SelectOptionViewModel } from '@app/directive/select/select-option.model';

interface SelectOptionsStoreProps {
	options: SelectOptionViewModel[];
	highlightedIndex: number | null;
	searchText: string;
}

const initialState: SelectOptionsStoreProps = {
	options: [],
	highlightedIndex: null,
	searchText: '',
};

@Injectable()
export class SelectOptionsStore extends signalStore(
	{ protectedState: false },
	withState(initialState),
) {
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
			label: option.textContent,
			disabled: option.disabled,
			selected: option.value === selectElement.value,
			highlighted: false,
		}));

		patchState(this, { options });
	}

	updateSelectedValue(value: string): void {
		patchState(this, {
			options: this.options().map((option) => ({ ...option, selected: option.value === value })),
		});
	}

	highlightInitialOption(): void {
		const visible = this.visibleOptions();
		const selectedIndex = visible.findIndex((option) => option.selected && !option.disabled);
		const fallbackIndex = visible.findIndex((option) => !option.disabled);

		this.highlightAt(-1 !== selectedIndex ? selectedIndex : fallbackIndex);
	}

	highlightNextOption(): void {
		this.moveHighlight(1);
	}

	highlightPreviousOption(): void {
		this.moveHighlight(-1);
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

	confirmHighlightedOption(): SelectOptionViewModel | null {
		const highlighted = this.visibleOptions()[this.highlightedIndex() ?? -1];

		if (undefined === highlighted || highlighted.disabled) {
			return null;
		}

		return highlighted;
	}

	clearHighlight(): void {
		patchState(this, { highlightedIndex: null });
	}

	appendSearchChar(char: string): void {
		patchState(this, { searchText: this.searchText() + char });
		this.highlightFirstMatch();
	}

	removeSearchChar(): void {
		if ('' === this.searchText()) {
			return;
		}

		patchState(this, { searchText: this.searchText().slice(0, -1) });
		this.highlightFirstMatch();
	}

	clearSearch(): void {
		if ('' === this.searchText()) {
			return;
		}

		patchState(this, { searchText: '', highlightedIndex: null });
	}

	private highlightFirstMatch(): void {
		const index = this.visibleOptions().findIndex((option) => !option.disabled);

		this.highlightAt(index);
	}

	private moveHighlight(step: 1 | -1): void {
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
}
