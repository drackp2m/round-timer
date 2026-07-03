/**
 * Tracks the rendered shell's wrapper element to measure its layout
 * (label width / input height CSS variables) and decide whether the
 * dropdown should open upwards. Pure DOM reads, no directive state.
 */
export class SelectLayoutTracker {
	private wrapperElement: HTMLElement | null = null;

	attach(shellHostElement: HTMLElement): void {
		const wrapperElement = shellHostElement.querySelector<HTMLElement>('.app-select');

		if (null === wrapperElement) {
			return;
		}

		this.wrapperElement = wrapperElement;

		const labelWidth = shellHostElement.querySelector<HTMLElement>('label span')?.offsetWidth ?? 0;
		const inputHeight = wrapperElement.offsetHeight;

		wrapperElement.style.setProperty('--label-width', `${labelWidth.toString()}px`);
		wrapperElement.style.setProperty('--input-height', `${inputHeight.toString()}px`);
	}

	contains(target: Node): boolean {
		return this.wrapperElement?.contains(target) ?? false;
	}

	isPositionedTop(): boolean {
		if (null === this.wrapperElement) {
			return false;
		}

		const rect = this.wrapperElement.getBoundingClientRect();
		const viewportMidpoint = window.innerHeight / 2;
		const elementMidpoint = rect.top + rect.height / 2;

		return elementMidpoint >= viewportMidpoint;
	}
}
