import { SelectStore } from '@app/directive/select/select.store';

export interface SelectInteractionHooks {
	isInsideShell: (target: Node) => boolean;
	openDropdown: () => void;
	closeDropdown: () => void;
	selectOption: (value: string) => void;
}

/**
 * Translates raw user events (keydown on the shell's search input,
 * pointer/mouse activity outside the shell while open) into store updates
 * and dropdown actions. Holds no DOM or option state itself.
 */
export class SelectInteractionHandler {
	constructor(
		private readonly store: SelectStore,
		private readonly hooks: SelectInteractionHooks,
	) {}

	handleKeydown(event: KeyboardEvent): void {
		switch (event.code) {
			case 'Enter':
				this.handleEnter(event);

				break;

			case 'Space':
				this.handleSpace(event);

				break;

			case 'Tab':
				this.handleTab(event);

				break;

			case 'Escape':
				this.handleEscape(event);

				break;

			case 'ArrowDown':
				this.handleArrow(event, 1);

				break;

			case 'ArrowUp':
				this.handleArrow(event, -1);

				break;

			default:
				this.handleSearchKey(event);
		}
	}

	attachOutsideListeners(): void {
		window.addEventListener('pointerdown', this.onPointerDown, { capture: true });
		window.addEventListener('mousemove', this.onMouseMove);
	}

	detachOutsideListeners(): void {
		window.removeEventListener('pointerdown', this.onPointerDown, { capture: true });
		window.removeEventListener('mousemove', this.onMouseMove);
	}

	/**
	 * Mimics native popup dismissal: the pointerdown that closes the dropdown
	 * is swallowed before reaching its target (hence the capture phase), so
	 * it neither moves the focus nor activates whatever sits under the
	 * pointer — e.g. another select's shell.
	 */
	private readonly onPointerDown = (event: PointerEvent): void => {
		if (this.hooks.isInsideShell(event.target as Node)) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		this.swallowNextClick();
		this.hooks.closeDropdown();
	};

	/**
	 * A swallowed pointerdown still produces a click; consume it too so the
	 * dismissing interaction stays inert end to end. Disarmed by the next
	 * pointerdown in case the click never fires (e.g. the pointer was
	 * dragged away before release).
	 */
	private swallowNextClick(): void {
		const controller = new AbortController();
		const { signal } = controller;

		window.addEventListener(
			'click',
			(event) => {
				event.preventDefault();
				event.stopPropagation();
				controller.abort();
			},
			{ capture: true, signal },
		);
		window.addEventListener(
			'pointerdown',
			() => {
				controller.abort();
			},
			{ capture: true, signal },
		);
	}

	private readonly onMouseMove = (event: MouseEvent): void => {
		if (!this.store.isOpen()) {
			return;
		}

		if (null !== (event.target as HTMLElement).closest('.option')) {
			return;
		}

		this.store.clearHighlight();
	};

	/**
	 * Escape only belongs to the select while its dropdown is open — and then
	 * it must not leak further (one press closes a single layer, e.g. not
	 * also a surrounding modal). Closed, it passes through untouched.
	 */
	private handleEscape(event: KeyboardEvent): void {
		if (!this.store.isOpen()) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		this.hooks.closeDropdown();
	}

	private handleEnter(event: KeyboardEvent): void {
		if (!this.store.isOpen()) {
			return;
		}

		event.preventDefault();
		this.confirmHighlighted();
	}

	/**
	 * Space only toggles/confirms while the search box is empty; once the
	 * user is typing it stays a regular character, handled natively by the
	 * search input.
	 */
	private handleSpace(event: KeyboardEvent): void {
		if ('' !== this.store.searchText()) {
			return;
		}

		event.preventDefault();

		if (this.store.isOpen()) {
			this.confirmHighlighted();
		} else {
			this.hooks.openDropdown();
		}
	}

	private handleTab(event: KeyboardEvent): void {
		if (!this.store.isOpen()) {
			return;
		}

		event.preventDefault();
		this.store.highlightFirstValidOption();
	}

	private handleArrow(event: KeyboardEvent, step: 1 | -1): void {
		event.preventDefault();

		if (this.store.isOpen()) {
			this.store.moveHighlight(step);
		} else {
			this.hooks.openDropdown();
		}
	}

	/**
	 * While open, typing belongs natively to the real search input (any
	 * character, paste included). Closed, a printable key opens the dropdown
	 * seeded with that character — the input still displays the selected
	 * value at that moment, so the default insertion must be suppressed.
	 * Modifier chords are left to the browser, except AltGr (reported as
	 * ctrl+alt), which is how several layouts type regular characters.
	 */
	private handleSearchKey(event: KeyboardEvent): void {
		const isAltGr = event.ctrlKey && event.altKey;
		const isShortcut = (event.ctrlKey || event.metaKey) && !isAltGr;

		if (!this.store.searchable() || this.store.isOpen() || 1 !== event.key.length || isShortcut) {
			return;
		}

		event.preventDefault();
		this.hooks.openDropdown();
		this.store.setSearchText(event.key);
	}

	private confirmHighlighted(): void {
		const option = this.store.confirmHighlightedOption();

		if (null !== option) {
			this.hooks.selectOption(option.value);
		}
	}
}
