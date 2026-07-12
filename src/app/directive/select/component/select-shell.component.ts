import { NgTemplateOutlet } from '@angular/common';
import {
	Component,
	DestroyRef,
	ElementRef,
	HostListener,
	TemplateRef,
	afterNextRender,
	computed,
	effect,
	inject,
	input,
	output,
	signal,
	viewChild,
} from '@angular/core';

import { SvgComponent } from '@app/component/svg.component';
import { SelectOptionViewModel, SelectStore } from '@app/directive/select/select.store';
import { ViewportService } from '@app/service/viewport.service';

/**
 * Themed shell rendered around the native `<select>` (projected via
 * `ng-content`). Reads the shared SelectStore directly and owns its own
 * layout concerns: measuring the label/input CSS variables and deciding
 * whether the dropdown should open upwards.
 *
 * Pointer events are handled at the host level: the shell is a pointer-only
 * surface, while focus and keyboard interaction belong to the projected
 * native select — the shell itself must never be focusable.
 */
@Component({
	selector: 'app-select-shell',
	templateUrl: './select-shell.component.html',
	imports: [SvgComponent, NgTemplateOutlet],
})
export class SelectShellComponent {
	readonly label = input.required<string>();
	readonly selectId = input.required<string>();
	readonly optionTemplate = input<TemplateRef<{ $implicit: SelectOptionViewModel }>>();

	readonly optionSelected = output<string>();
	readonly toggleRequested = output();

	protected readonly store = inject(SelectStore);
	protected readonly positionTop = signal(false);

	/**
	 * Screen-reader feedback while the dropdown is open: the custom listbox
	 * is a purely visual layer (hidden from the accessibility tree), so
	 * highlight movements are voiced through a polite live region instead.
	 */
	protected readonly announcement = computed<string>(() => {
		if (!this.store.isOpen()) {
			return '';
		}

		const options = this.store.visibleOptions();
		const highlightedIndex = options.findIndex((option) => option.highlighted);
		const highlighted = options[highlightedIndex];

		if (0 === options.length) {
			return 'No matches found';
		}

		if (undefined === highlighted) {
			return '';
		}

		return `${highlighted.label}, ${(highlightedIndex + 1).toString()} of ${options.length.toString()}`;
	});

	private readonly viewportService = inject(ViewportService);
	private readonly destroyRef = inject(DestroyRef);
	private readonly wrapper = viewChild<ElementRef<HTMLElement>>('wrapper');
	private readonly labelText = viewChild<ElementRef<HTMLElement>>('labelText');
	private togglesOnClick = false;
	private receivedPointerDown = false;

	constructor() {
		afterNextRender(() => {
			this.observeSizeChanges();
		});

		effect(() => {
			this.store.isOpen();
			this.viewportService.routerOutletScroll();
			this.viewportService.windowResized();

			this.positionTop.set(this.isPositionedTop());
		});
	}

	/**
	 * For direct pointers (finger, stylus), `pointerdown` fires before the
	 * browser knows whether the gesture is a tap or a scroll, so toggling is
	 * deferred to `click` (which never fires after a pan). Skipping
	 * `preventDefault()` there also lets the browser blur whatever element
	 * currently holds the focus.
	 */
	@HostListener('pointerdown', ['$event'])
	onWrapperPointerDown(event: PointerEvent): void {
		this.receivedPointerDown = true;
		this.togglesOnClick = false;

		if (this.isInsideOptions(event.target)) {
			return;
		}

		if ('touch' === event.pointerType || 'pen' === event.pointerType) {
			this.togglesOnClick = true;

			return;
		}

		event.preventDefault();
		this.toggleRequested.emit();
	}

	// The gesture turned into a scroll: no click will follow, so the pending
	// state must be discarded before the next interaction.
	@HostListener('pointercancel')
	onWrapperPointerCancel(): void {
		this.receivedPointerDown = false;
		this.togglesOnClick = false;
	}

	/**
	 * Toggling from `click` covers two cases: direct-pointer taps (deferred
	 * from pointerdown once the gesture is known not to be a scroll) and
	 * clicks that arrive with no pointerdown at all — Safari suppresses only
	 * the pointerdown of the click that dismisses a native select popup,
	 * while assistive tech emits bare synthetic clicks.
	 */
	@HostListener('click', ['$event'])
	onWrapperClick(event: MouseEvent): void {
		const togglesNow = this.togglesOnClick || !this.receivedPointerDown;

		this.receivedPointerDown = false;
		this.togglesOnClick = false;

		if (!togglesNow || this.isInsideOptions(event.target)) {
			return;
		}

		this.toggleRequested.emit();
	}

	selectOption(option: SelectOptionViewModel): void {
		if (!option.disabled) {
			this.optionSelected.emit(option.value);
		}
	}

	hoverOption(option: SelectOptionViewModel, index: number): void {
		if (!option.disabled) {
			this.store.highlightAt(index);
		}
	}

	private isInsideOptions(target: EventTarget | null): boolean {
		return null !== (target as HTMLElement).closest('.app-select-options');
	}

	/**
	 * The label width is not static: translations resolve asynchronously, the
	 * language can change at runtime and web fonts reflow the text once they
	 * load. A ResizeObserver on the hidden measure span (and on the wrapper,
	 * for the height) re-measures on every such change — including the initial
	 * layout, since observers fire once on `observe()`.
	 */
	private observeSizeChanges(): void {
		const wrapperElement = this.wrapper()?.nativeElement;
		const labelElement = this.labelText()?.nativeElement;

		if (undefined === wrapperElement || undefined === labelElement) {
			return;
		}

		const observer = new ResizeObserver(() => {
			this.applySizeVariables();
		});

		observer.observe(labelElement);
		observer.observe(wrapperElement);

		this.destroyRef.onDestroy(() => {
			observer.disconnect();
		});
	}

	private applySizeVariables(): void {
		const wrapperElement = this.wrapper()?.nativeElement;

		if (undefined === wrapperElement) {
			return;
		}

		const labelWidth = this.labelText()?.nativeElement.offsetWidth ?? 0;

		wrapperElement.style.setProperty('--label-width', `${labelWidth.toString()}px`);
		wrapperElement.style.setProperty(
			'--input-height',
			`${wrapperElement.offsetHeight.toString()}px`,
		);
	}

	private isPositionedTop(): boolean {
		const wrapperElement = this.wrapper()?.nativeElement;

		if (undefined === wrapperElement) {
			return false;
		}

		const rect = wrapperElement.getBoundingClientRect();
		const viewportMidpoint = window.innerHeight / 2;
		const elementMidpoint = rect.top + rect.height / 2;

		return elementMidpoint >= viewportMidpoint;
	}
}
