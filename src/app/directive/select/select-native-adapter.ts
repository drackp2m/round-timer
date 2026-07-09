/**
 * Wraps the native `<select>` element reads/writes the directive needs:
 * resolving its id, reading the currently selected text, checking whether
 * it has a value, and applying a new value while notifying reactive forms
 * via a synthetic `change` event (since setting `.value` programmatically
 * doesn't fire one on its own).
 */
export class SelectNativeAdapter {
	constructor(private readonly selectElement: HTMLSelectElement) {}

	ensureId(fallbackId: string): string {
		if ('' === this.selectElement.id) {
			this.selectElement.id = fallbackId;
		}

		return this.selectElement.id;
	}

	/**
	 * When the select has no empty-valued option, prepends a generic
	 * placeholder so the field can start "unset". It only becomes the active
	 * selection when nothing was explicitly pre-selected (no `selected`
	 * attribute and no non-first option chosen), otherwise the existing
	 * selection is preserved.
	 */
	ensurePlaceholder(text: string): void {
		const options = Array.from(this.selectElement.options);

		if (options.some((option) => '' === option.value)) {
			return;
		}

		const hasPreselection =
			0 < this.selectElement.selectedIndex || (options[0]?.defaultSelected ?? false);

		this.selectElement.prepend(new Option(text, ''));

		if (!hasPreselection) {
			this.selectElement.value = '';
		}
	}

	getValue(): string {
		return this.selectElement.value;
	}

	getSelectedText(): string {
		const selectedOption = this.selectElement.options[this.selectElement.selectedIndex];

		return selectedOption?.text ?? '';
	}

	isFilled(): boolean {
		return '' !== this.selectElement.value;
	}

	applyValue(value: string): void {
		this.selectElement.value = value;
		this.selectElement.dispatchEvent(new Event('change', { bubbles: true }));
	}

	focus(): void {
		this.selectElement.focus();
	}
}
