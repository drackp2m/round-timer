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
 * Pointer events are handled at the host level. Focus, keyboard and text
 * rendering belong to the shell's own combobox search input; the projected
 * native select only carries the form value.
 */
@Component({
	selector: 'app-select-shell',
	templateUrl: './select-shell.component.html',
	imports: [SvgComponent, NgTemplateOutlet],
})
export class SelectShellComponent {
	readonly label = input.required<string>();
	readonly selectId = input.required<string>();
	readonly placeholder = input.required<string>();
	readonly optionTemplate = input<TemplateRef<{ $implicit: SelectOptionViewModel }>>();

	readonly optionSelected = output<string>();
	readonly toggleRequested = output();
	readonly closeRequested = output();
	readonly searchKeydown = output<KeyboardEvent>();

	protected readonly store = inject(SelectStore);
	protected readonly positionTop = signal(false);
	protected readonly searchInputId = computed<string>(() => `${this.selectId()}-search`);
	protected readonly listboxId = computed<string>(() => `${this.selectId()}-listbox`);

	/**
	 * The field's single visible text: the live search while open (it always
	 * starts empty — the search is cleared on close), the selected option's
	 * text once closed, or nothing at all so the placeholder shows through.
	 * Non-searchable fields keep showing the selected text while open, since
	 * there is no search to make room for.
	 */
	protected readonly displayText = computed<string>(() => {
		if (this.store.isOpen() && this.store.searchable()) {
			return this.store.searchText();
		}

		return this.store.filled() ? this.store.selectedText() : '';
	});

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
	private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
	private readonly coarsePointer = window.matchMedia('(pointer: coarse)').matches;
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

		// Pointer interactions inside the real search input must stay fully
		// native (focus, caret placement, text selection); whether the
		// dropdown opens is decided on click.
		if (this.isInsideSearchInput(event.target)) {
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

		if (this.isInsideOptions(event.target)) {
			return;
		}

		// A click inside the search input only ever opens the dropdown
		// (closing it or moving the caret is native business) — and not when
		// the user just finished dragging a text selection to copy the value.
		if (this.isInsideSearchInput(event.target)) {
			if (!this.store.isOpen() && !this.hasTextSelection()) {
				this.toggleRequested.emit();
			}

			return;
		}

		if (!togglesNow) {
			return;
		}

		this.toggleRequested.emit();
	}

	focusSearchInput(): void {
		this.searchInput()?.nativeElement.focus();
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

	protected onSearchFocus(): void {
		this.store.setFocused(true);
	}

	protected onSearchBlur(): void {
		this.store.setFocused(false);
		this.closeRequested.emit();
	}

	protected onSearchInput(event: Event): void {
		const value = (event.target as HTMLInputElement).value;

		// Editing can also start while closed (paste, IME composition): the
		// dropdown must open — which clears the previous search — before the
		// new text lands in the store.
		if (!this.store.isOpen()) {
			this.toggleRequested.emit();
		}

		this.store.setSearchText(value);
	}

	private isInsideOptions(target: EventTarget | null): boolean {
		return null !== (target as HTMLElement).closest('.app-select-options');
	}

	private isInsideSearchInput(target: EventTarget | null): boolean {
		return null !== (target as HTMLElement).closest('.search-input');
	}

	private hasTextSelection(): boolean {
		const element = this.searchInput()?.nativeElement;

		return undefined !== element && element.selectionStart !== element.selectionEnd;
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

	/**
	 * Coarse-pointer devices always open upwards while the field is
	 * searchable: focusing the editable input pops the virtual keyboard and
	 * the browser auto-scrolls the field into view, which would fight a
	 * downward dropdown. A read-only combobox never summons the keyboard,
	 * so it positions freely.
	 */
	private isPositionedTop(): boolean {
		if (this.coarsePointer && this.store.searchable()) {
			return true;
		}

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
