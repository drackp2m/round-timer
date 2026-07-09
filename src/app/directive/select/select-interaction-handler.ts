import { SelectStore } from '@app/directive/select/select.store';

export interface SelectInteractionHooks {
	isInsideShell: (target: Node) => boolean;
	getFocusElement: () => HTMLElement;
	openDropdown: () => void;
	closeDropdown: () => void;
	selectOption: (value: string) => void;
}

/**
 * Translates raw user events (keydown on the native select, pointer/mouse
 * activity outside the shell while open) into store updates and dropdown
 * actions. Holds no DOM or option state itself.
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
				event.preventDefault();
				this.hooks.closeDropdown();

				break;

			case 'ArrowDown':
				this.handleArrow(event, 1);

				break;

			case 'ArrowUp':
				this.handleArrow(event, -1);

				break;

			case 'Backspace':
				event.preventDefault();
				this.store.removeSearchChar();

				break;

			default:
				this.handleSearchKey(event);
		}
	}

	attachOutsideListeners(): void {
		window.addEventListener('pointerdown', this.onPointerDown);
		window.addEventListener('mousemove', this.onMouseMove);
	}

	detachOutsideListeners(): void {
		window.removeEventListener('pointerdown', this.onPointerDown);
		window.removeEventListener('mousemove', this.onMouseMove);
	}

	private readonly onPointerDown = (event: PointerEvent): void => {
		if (this.hooks.isInsideShell(event.target as Node)) {
			return;
		}

		const willCauseFocusLoss = document.activeElement === this.hooks.getFocusElement();

		if (willCauseFocusLoss) {
			event.preventDefault();
			event.stopPropagation();
		}

		this.hooks.closeDropdown();
	};

	private readonly onMouseMove = (event: MouseEvent): void => {
		if (!this.store.isOpen()) {
			return;
		}

		if (null !== (event.target as HTMLElement).closest('.option')) {
			return;
		}

		this.store.clearHighlight();
	};

	private handleEnter(event: KeyboardEvent): void {
		if (!this.store.isOpen()) {
			return;
		}

		event.preventDefault();
		this.confirmHighlighted();
	}

	private handleSpace(event: KeyboardEvent): void {
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

	private handleSearchKey(event: KeyboardEvent): void {
		if (!/^[a-z0-9]$/i.test(event.key)) {
			return;
		}

		event.preventDefault();

		if (!this.store.isOpen()) {
			this.hooks.openDropdown();
		}

		this.store.appendSearchChar(event.key);
	}

	private confirmHighlighted(): void {
		const option = this.store.confirmHighlightedOption();

		if (null !== option) {
			this.hooks.selectOption(option.value);
		}
	}
}
