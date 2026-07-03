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

	getCurrentSelectedText(): string {
		const selectedOption = this.selectElement.options[this.selectElement.selectedIndex];

		return selectedOption?.textContent ?? '';
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
