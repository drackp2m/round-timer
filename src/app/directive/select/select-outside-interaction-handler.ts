export interface SelectOutsideInteractionCallbacks {
	isOpen: () => boolean;
	isInsideWrapper: (target: Node) => boolean;
	getFocusElement: () => HTMLElement;
	onOutsideClick: () => void;
	onPointerLeaveOptions: () => void;
}

/**
 * Owns the `window`-level listeners needed while the dropdown is open:
 * closing on an outside click and clearing the mouse-highlighted option
 * once the pointer leaves the options list. `attach`/`detach` keep the
 * add/remove pair symmetric in one place instead of scattered across
 * open/close/destroy call sites.
 */
export class SelectOutsideInteractionHandler {
	constructor(private readonly callbacks: SelectOutsideInteractionCallbacks) {}

	attach(): void {
		window.addEventListener('mousedown', this.onMouseDown);
		window.addEventListener('mousemove', this.onMouseMove);
	}

	detach(): void {
		window.removeEventListener('mousedown', this.onMouseDown);
		window.removeEventListener('mousemove', this.onMouseMove);
	}

	private onMouseMove = (event: MouseEvent): void => {
		if (!this.callbacks.isOpen()) {
			return;
		}

		const target = event.target as HTMLElement;

		if (null !== target.closest('.option')) {
			return;
		}

		this.callbacks.onPointerLeaveOptions();
	};

	private onMouseDown = (event: MouseEvent): void => {
		if (this.callbacks.isInsideWrapper(event.target as Node)) {
			return;
		}

		const willCauseFocusLoss = document.activeElement === this.callbacks.getFocusElement();

		if (willCauseFocusLoss) {
			event.preventDefault();
			event.stopPropagation();
		}

		this.callbacks.onOutsideClick();
	};
}
