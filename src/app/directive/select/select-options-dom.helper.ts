import { Renderer2 } from '@angular/core';

import { createTypedElement } from '@app/util/renderer';

const HIGHLIGHTED_CLASS = 'highlighted';

export class SelectOptionsDomHelper {
	private optionsContainer: HTMLElement | null = null;
	private highlightedOptionIndex: number | null = null;

	constructor(
		private readonly renderer2: Renderer2,
		private readonly selectElement: HTMLSelectElement,
		private readonly onOptionConfirmed: () => void,
	) {}

	setContainer(optionsContainer: HTMLElement | null): void {
		this.optionsContainer = optionsContainer;
	}

	projectOptions(): void {
		if (null === this.optionsContainer) {
			return;
		}

		while (null !== this.optionsContainer.firstChild) {
			this.optionsContainer.removeChild(this.optionsContainer.firstChild);
		}

		Array.from(this.selectElement.options).forEach((option, index) => {
			const optionElement = createTypedElement(this.renderer2, 'div');

			this.renderer2.addClass(optionElement, 'option');

			if (option.disabled) {
				this.renderer2.addClass(optionElement, 'disabled');
			}

			if (option.value === this.selectElement.value) {
				this.renderer2.addClass(optionElement, 'selected');
			}

			this.renderer2.setProperty(optionElement, 'textContent', option.textContent);
			this.renderer2.setAttribute(optionElement, 'data-value', option.value);

			this.renderer2.appendChild(this.optionsContainer, optionElement);

			this.addEventListenersToOption(optionElement, index);
		});
	}

	updateSelectedOptionClass(): void {
		if (null === this.optionsContainer) {
			return;
		}

		const options = this.getOptionElements();
		const currentValue = this.selectElement.value;

		options.forEach((option) => {
			const isSelected = option.getAttribute('data-value') === currentValue;

			if (isSelected) {
				this.renderer2.addClass(option, 'selected');
			} else {
				this.renderer2.removeClass(option, 'selected');
			}
		});
	}

	highlightInitialOption(): void {
		const options = this.getOptionElements();
		const selectedIndex = options.findIndex((option) => option.classList.contains('selected'));

		if (-1 !== selectedIndex) {
			this.highlightOptionAt(selectedIndex);

			return;
		}

		const firstEnabledIndex = options.findIndex((option) => !option.classList.contains('disabled'));

		if (-1 !== firstEnabledIndex) {
			this.highlightOptionAt(firstEnabledIndex);
		}
	}

	highlightNextOption(): void {
		const options = this.getOptionElements();
		const startIndex = this.highlightedOptionIndex ?? -1;

		for (let index = startIndex + 1; index < options.length; index++) {
			const option = options[index];

			if (undefined !== option && !option.classList.contains('disabled')) {
				this.highlightOptionAt(index);

				return;
			}
		}
	}

	highlightPreviousOption(): void {
		const options = this.getOptionElements();
		const startIndex = this.highlightedOptionIndex ?? options.length;

		for (let index = startIndex - 1; 0 <= index; index--) {
			const option = options[index];

			if (undefined !== option && !option.classList.contains('disabled')) {
				this.highlightOptionAt(index);

				return;
			}
		}
	}

	highlightFirstValidOption(): void {
		const options = this.getOptionElements();
		const firstValidIndex = options.findIndex(
			(option) =>
				'' !== option.getAttribute('data-value') && !option.classList.contains('disabled'),
		);

		if (-1 !== firstValidIndex) {
			this.highlightOptionAt(firstValidIndex);
		}
	}

	confirmHighlightedOption(): void {
		if (null === this.highlightedOptionIndex) {
			return;
		}

		const options = this.getOptionElements();
		const highlighted = options[this.highlightedOptionIndex];

		if (undefined === highlighted || highlighted.classList.contains('disabled')) {
			return;
		}

		highlighted.click();
	}

	clearHighlight = (): void => {
		if (null === this.optionsContainer) {
			return;
		}

		if (null !== this.highlightedOptionIndex) {
			const options = this.getOptionElements();
			const current = options[this.highlightedOptionIndex];

			if (undefined !== current) {
				this.renderer2.removeClass(current, HIGHLIGHTED_CLASS);
			}

			this.highlightedOptionIndex = null;
		}
	};

	private highlightOptionAt(index: number): void {
		if (null === this.optionsContainer) {
			return;
		}

		const options = this.getOptionElements();

		if (0 > index || index >= options.length) {
			return;
		}

		if (null !== this.highlightedOptionIndex) {
			const current = options[this.highlightedOptionIndex];

			if (undefined !== current) {
				this.renderer2.removeClass(current, HIGHLIGHTED_CLASS);
			}
		}

		const next = options[index];
		this.renderer2.addClass(next, HIGHLIGHTED_CLASS);
		next?.scrollIntoView({ block: 'nearest' });

		this.highlightedOptionIndex = index;
	}

	private getOptionElements(): HTMLDivElement[] {
		if (null === this.optionsContainer) {
			return [];
		}

		return Array.from(this.optionsContainer.children) as HTMLDivElement[];
	}

	private addEventListenersToOption(option: HTMLDivElement, index: number): void {
		option.addEventListener('mousedown', (event) => {
			event.preventDefault();
		});

		option.addEventListener('mouseenter', () => {
			this.highlightOptionAt(index);
		});

		option.addEventListener('click', () => {
			const value = option.getAttribute('data-value');

			if (null !== value) {
				this.selectElement.value = value;
				this.updateSelectedOptionClass();
				this.onOptionConfirmed();
				this.selectElement.dispatchEvent(new Event('change', { bubbles: true }));
			}
		});
	}
}
