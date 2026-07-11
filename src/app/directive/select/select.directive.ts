import {
	AfterViewInit,
	ComponentRef,
	Directive,
	ElementRef,
	HostListener,
	Injector,
	OnDestroy,
	TemplateRef,
	ViewContainerRef,
	effect,
	inject,
	input,
} from '@angular/core';

import { SelectShellComponent } from '@app/directive/select/component/select-shell.component';
import { SelectInteractionHandler } from '@app/directive/select/select-interaction-handler';
import { SelectNativeAdapter } from '@app/directive/select/select-native-adapter';
import { SelectOptionViewModel, SelectStore } from '@app/directive/select/select.store';

let nextSelectId = 0;

/**
 * Progressive enhancement over a native `<select>`: keeps the native element
 * as the source of truth (focus, forms, a11y) while rendering a themed shell
 * with a custom dropdown around it. Orchestrates the store, the shell
 * component and the interaction handler.
 */
@Directive({
	selector: 'select[appThemed]',
	providers: [SelectStore],
})
export class SelectDirective implements AfterViewInit, OnDestroy {
	readonly label = input.required<string>();
	readonly placeholder = input('Choose an option');
	readonly optionTemplate = input<TemplateRef<{ $implicit: SelectOptionViewModel }>>();

	private readonly elementRef = inject<ElementRef<HTMLSelectElement>>(ElementRef);
	private readonly viewContainerRef = inject(ViewContainerRef);
	private readonly injector = inject(Injector);
	private readonly store = inject(SelectStore);
	private readonly nativeAdapter = new SelectNativeAdapter(this.elementRef.nativeElement);
	/**
	 * Device-level proxy for platforms where giving the native select real
	 * DOM focus opens the native picker (iOS/iPadOS). That side effect
	 * depends on the OS, not on the pointer of a given interaction — an iPad
	 * trackpad click must avoid real focus too — hence a media query here
	 * while the shell reads each event's pointerType for gesture handling.
	 */
	private readonly coarsePointer = window.matchMedia('(pointer: coarse)').matches;

	private readonly interaction = new SelectInteractionHandler(this.store, {
		isInsideShell: (target) => this.shellElement?.contains(target) ?? false,
		openDropdown: () => {
			this.openDropdown();
		},
		closeDropdown: () => {
			this.closeDropdown();
		},
		selectOption: (value) => {
			this.selectOption(value);
		},
	});

	private shellRef: ComponentRef<SelectShellComponent> | null = null;
	private shellElement: HTMLElement | null = null;

	constructor() {
		effect(() => {
			this.shellRef?.setInput('label', this.label());
			this.shellRef?.setInput('optionTemplate', this.optionTemplate());

			// The visible label text lives in the shell's visual layers, which
			// are hidden from the accessibility tree — without this the select
			// would have no accessible name.
			this.elementRef.nativeElement.setAttribute('aria-label', this.label());
		});
	}

	@HostListener('focus')
	onFocus() {
		this.store.setFocused(true);
	}

	@HostListener('blur')
	onBlur() {
		this.store.setFocused(false);
	}

	@HostListener('input')
	@HostListener('change')
	onNativeValueChange() {
		this.store.updateSelection(this.nativeAdapter.getValue(), this.nativeAdapter.getSelectedText());
	}

	@HostListener('keydown', ['$event'])
	onKeyDown(event: KeyboardEvent) {
		this.interaction.handleKeydown(event);
	}

	ngAfterViewInit(): void {
		this.syncFromNativeSelect();
		this.nativeAdapter.setExpanded(false);
		this.nativeAdapter.observeValueWrites(() => {
			this.onNativeValueChange();
		});
		this.nativeAdapter.observeOptionChanges(() => {
			this.syncFromNativeSelect();
		});
		this.createShell();
	}

	ngOnDestroy(): void {
		this.nativeAdapter.stopObservingOptionChanges();
		this.interaction.detachOutsideListeners();
	}

	private syncFromNativeSelect(): void {
		const disabled = this.nativeAdapter.isDisabled();

		this.nativeAdapter.ensurePlaceholder(this.placeholder());
		this.store.setOptionsFromSelect(this.elementRef.nativeElement);
		this.store.setDisabled(disabled);
		this.onNativeValueChange();

		if (disabled && this.store.isOpen()) {
			this.closeDropdown();
		}
	}

	private createShell(): void {
		const selectId = this.nativeAdapter.ensureId(`app-select-${(nextSelectId++).toString()}`);
		const componentRef = this.viewContainerRef.createComponent(SelectShellComponent, {
			injector: this.injector,
			projectableNodes: [[this.elementRef.nativeElement]],
		});

		componentRef.setInput('label', this.label());
		componentRef.setInput('selectId', selectId);
		componentRef.setInput('optionTemplate', this.optionTemplate());

		componentRef.instance.optionSelected.subscribe((value) => {
			this.selectOption(value);
		});
		componentRef.instance.toggleRequested.subscribe(() => {
			this.toggleDropdown();
		});

		componentRef.changeDetectorRef.detectChanges();

		this.shellRef = componentRef;
		this.shellElement = componentRef.location.nativeElement as HTMLElement;
	}

	private toggleDropdown(): void {
		if (this.store.disabled()) {
			return;
		}

		if (this.coarsePointer) {
			this.blurActiveElement();
		} else {
			this.nativeAdapter.focus();
		}

		if (this.store.isOpen()) {
			this.closeDropdown();

			return;
		}

		this.openDropdown();

		// When the native select could not take real focus (skipped or
		// refused), the focused look is simulated in the store instead.
		if (!this.hasNativeFocus()) {
			this.store.setFocused(true);
		}
	}

	private openDropdown(): void {
		this.store.openDropdown();
		this.interaction.attachOutsideListeners();
		this.nativeAdapter.setExpanded(true);
	}

	private closeDropdown(): void {
		this.store.closeDropdown();
		this.interaction.detachOutsideListeners();
		this.nativeAdapter.setExpanded(false);

		if (!this.hasNativeFocus()) {
			this.store.setFocused(false);
		}
	}

	private hasNativeFocus(): boolean {
		return document.activeElement === this.elementRef.nativeElement;
	}

	/**
	 * On coarse-pointer platforms the native select never receives real DOM
	 * focus (it would open the native dropdown on iOS), so whatever element
	 * held the focus before tapping the shell must be blurred by hand.
	 */
	private blurActiveElement(): void {
		const activeElement = document.activeElement;

		if (activeElement instanceof HTMLElement && !this.hasNativeFocus()) {
			activeElement.blur();
		}
	}

	private selectOption(value: string): void {
		this.nativeAdapter.applyValue(value);
		this.closeDropdown();
	}
}
