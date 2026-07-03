export interface SelectKeyboardCallbacks {
	isOpen: () => boolean;
	openDropdown: () => void;
	closeDropdown: () => void;
	highlightNext: () => void;
	highlightPrevious: () => void;
	confirmHighlighted: () => void;
	highlightTabTarget: () => void;
	onSearchInput: (char: string) => void;
	onSearchBackspace: () => void;
}

/**
 * Translates raw keydown events into dropdown actions.
 * Holds no DOM/option state itself - delegates everything via callbacks.
 */
export class SelectKeyboardHandler {
	constructor(private readonly callbacks: SelectKeyboardCallbacks) {}

	handle(event: KeyboardEvent): void {
		if ('Enter' === event.code) {
			this.handleEnter(event);

			return;
		}

		if ('Tab' === event.code) {
			this.handleTab(event);

			return;
		}

		if ('Backspace' === event.code) {
			event.preventDefault();
			this.callbacks.onSearchBackspace();

			return;
		}

		if (this.isNavigationKey(event.code)) {
			this.handleNavigationKey(event);

			return;
		}

		if (/^[a-z0-9]$/i.test(event.key)) {
			event.preventDefault();
			this.callbacks.onSearchInput(event.key);
		}
	}

	private handleEnter(event: KeyboardEvent): void {
		if (!this.callbacks.isOpen()) {
			return;
		}

		event.preventDefault();
		this.callbacks.confirmHighlighted();
	}

	private handleTab(event: KeyboardEvent): void {
		if (!this.callbacks.isOpen()) {
			return;
		}

		event.preventDefault();
		this.callbacks.highlightTabTarget();
	}

	private isNavigationKey(code: string): boolean {
		return ['Space', 'ArrowDown', 'ArrowUp', 'Escape'].includes(code);
	}

	private handleNavigationKey(event: KeyboardEvent): void {
		event.preventDefault();

		if ('Space' === event.code) {
			if (this.callbacks.isOpen()) {
				this.callbacks.confirmHighlighted();
			} else {
				this.callbacks.openDropdown();
			}

			return;
		}

		if ('ArrowDown' === event.code) {
			this.handleArrow(this.callbacks.highlightNext);

			return;
		}

		if ('ArrowUp' === event.code) {
			this.handleArrow(this.callbacks.highlightPrevious);

			return;
		}

		if ('Escape' === event.code) {
			this.callbacks.closeDropdown();
		}
	}

	private handleArrow(highlightAction: () => void): void {
		if (this.callbacks.isOpen()) {
			highlightAction();
		} else {
			this.callbacks.openDropdown();
		}
	}
}
