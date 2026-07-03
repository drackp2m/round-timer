import {
	AfterViewInit,
	ComponentRef,
	Directive,
	ElementRef,
	HostListener,
	OnDestroy,
	OutputRefSubscription,
	TemplateRef,
	ViewContainerRef,
	computed,
	effect,
	inject,
	input,
	signal,
} from '@angular/core';

import {
	SelectShellComponent,
	SelectShellViewModel,
} from '@app/directive/select/component/select-shell.component';
import { SelectKeyboardHandler } from '@app/directive/select/select-keyboard-handler';
import { SelectLayoutTracker } from '@app/directive/select/select-layout-tracker';
import { SelectNativeAdapter } from '@app/directive/select/select-native-adapter';
import { SelectOptionViewModel } from '@app/directive/select/select-option.model';
import { SelectOptionsStore } from '@app/directive/select/select-options.store';
import { SelectOutsideInteractionHandler } from '@app/directive/select/select-outside-interaction-handler';
import { ViewportService } from '@app/service/viewport.service';

let nextSelectId = 0;

// ToDo => add default placeholder as "Select an option"
@Directive({
	selector: 'select[appThemed]',
	providers: [SelectOptionsStore],
})
export class SelectDirective implements AfterViewInit, OnDestroy {
	readonly label = input.required<string>();
	readonly optionTemplate = input<TemplateRef<{ $implicit: SelectOptionViewModel }>>();

	private readonly elementRef = inject<ElementRef<HTMLSelectElement>>(ElementRef);
	private readonly viewContainerRef = inject(ViewContainerRef);
	private readonly viewportService = inject(ViewportService);
	private readonly optionsStore = inject(SelectOptionsStore);
	private readonly nativeAdapter = new SelectNativeAdapter(this.elementRef.nativeElement);

	private readonly fallbackSelectId = `app-select-${(nextSelectId++).toString()}`;
	private selectId = this.fallbackSelectId;

	private readonly isOpenSignal = signal(false);
	private readonly focusedSignal = signal(false);
	private readonly filledSignal = signal(false);
	private readonly positionTopSignal = signal(false);
	private readonly selectedTextSignal = signal('');

	private readonly shellRef = signal<ComponentRef<SelectShellComponent> | null>(null);
	private readonly layout = new SelectLayoutTracker();
	private optionSelectedSubscription: OutputRefSubscription | null = null;
	private optionHoveredSubscription: OutputRefSubscription | null = null;

	private readonly viewModel = computed<SelectShellViewModel>(() => ({
		label: this.label(),
		selectId: this.selectId,
		selectedText: this.selectedTextSignal(),
		searchText: this.optionsStore.searchText(),
		isSearching: '' !== this.optionsStore.searchText(),
		isOpen: this.isOpenSignal(),
		positionTop: this.positionTopSignal(),
		focused: this.focusedSignal(),
		filled: this.filledSignal(),
		options: this.optionsStore.visibleOptions(),
		optionTemplate: this.optionTemplate(),
	}));

	private readonly keyboardHandler = new SelectKeyboardHandler({
		isOpen: () => this.isDropdownOpen(),
		openDropdown: () => {
			this.openCustomDropdown();
		},
		closeDropdown: () => {
			this.closeCustomDropdown();
		},
		highlightNext: () => {
			this.optionsStore.highlightNextOption();
		},
		highlightPrevious: () => {
			this.optionsStore.highlightPreviousOption();
		},
		confirmHighlighted: () => {
			this.confirmHighlightedOption();
		},
		highlightTabTarget: () => {
			this.optionsStore.highlightFirstValidOption();
		},
		onSearchInput: (char) => {
			this.appendToSearch(char);
		},
		onSearchBackspace: () => {
			this.optionsStore.removeSearchChar();
		},
	});

	private readonly outsideInteraction = new SelectOutsideInteractionHandler({
		isOpen: () => this.isDropdownOpen(),
		isInsideWrapper: (target) => this.layout.contains(target),
		getFocusElement: () => this.elementRef.nativeElement,
		onOutsideClick: () => {
			this.closeCustomDropdown();
			this.updatePositionClass();
		},
		onPointerLeaveOptions: () => {
			this.optionsStore.clearHighlight();
		},
	});

	constructor() {
		effect(() => {
			this.shellRef()?.setInput('viewModel', this.viewModel());
		});

		effect(() => {
			this.viewportService.routerOutletScroll();
			this.viewportService.windowResized();

			this.updatePositionClass();
		});
	}

	@HostListener('focus')
	onFocus() {
		this.focusedSignal.set(true);
	}

	@HostListener('blur')
	onBlur() {
		this.focusedSignal.set(false);
	}

	@HostListener('input')
	@HostListener('change')
	onInput() {
		this.filledSignal.set(this.nativeAdapter.isFilled());
	}

	@HostListener('mousedown', ['$event'])
	onMouseDown(event: MouseEvent) {
		event.preventDefault();
		this.nativeAdapter.focus();
		this.toggleCustomDropdown();
	}

	@HostListener('keydown', ['$event'])
	onKeyDown(event: KeyboardEvent) {
		this.keyboardHandler.handle(event);
	}

	ngAfterViewInit(): void {
		const nativeSelect = this.elementRef.nativeElement;

		this.selectId = this.nativeAdapter.ensureId(this.fallbackSelectId);

		this.optionsStore.setOptionsFromSelect(nativeSelect);
		this.selectedTextSignal.set(this.nativeAdapter.getCurrentSelectedText());
		this.filledSignal.set(this.nativeAdapter.isFilled());

		const componentRef = this.viewContainerRef.createComponent(SelectShellComponent, {
			projectableNodes: [[nativeSelect]],
		});

		componentRef.setInput('viewModel', this.viewModel());
		componentRef.changeDetectorRef.detectChanges();

		this.optionSelectedSubscription = componentRef.instance.optionSelected.subscribe((value) => {
			this.applySelectedValue(value);
		});
		this.optionHoveredSubscription = componentRef.instance.optionHovered.subscribe((index) => {
			this.optionsStore.highlightAt(index);
		});

		this.shellRef.set(componentRef);
		this.layout.attach(componentRef.location.nativeElement as HTMLElement);
		this.updatePositionClass();
	}

	ngOnDestroy(): void {
		this.outsideInteraction.detach();
		this.optionSelectedSubscription?.unsubscribe();
		this.optionHoveredSubscription?.unsubscribe();
	}

	private isDropdownOpen(): boolean {
		return this.isOpenSignal();
	}

	private updatePositionClass(): void {
		this.positionTopSignal.set(this.layout.isPositionedTop());
	}

	private toggleCustomDropdown() {
		if (this.isDropdownOpen()) {
			this.closeCustomDropdown();
		} else {
			this.openCustomDropdown();
		}

		this.updatePositionClass();
	}

	private openCustomDropdown() {
		this.isOpenSignal.set(true);
		this.outsideInteraction.attach();

		this.optionsStore.highlightInitialOption();
		this.updatePositionClass();
	}

	private closeCustomDropdown() {
		this.isOpenSignal.set(false);
		this.outsideInteraction.detach();

		this.optionsStore.clearHighlight();
		this.optionsStore.clearSearch();
	}

	private confirmHighlightedOption(): void {
		const option = this.optionsStore.confirmHighlightedOption();

		if (null === option) {
			return;
		}

		this.applySelectedValue(option.value);
	}

	private applySelectedValue(value: string): void {
		this.nativeAdapter.applyValue(value);
		this.optionsStore.updateSelectedValue(value);
		this.selectedTextSignal.set(this.nativeAdapter.getCurrentSelectedText());
		this.filledSignal.set(this.nativeAdapter.isFilled());
		this.closeCustomDropdown();
	}

	private appendToSearch(char: string): void {
		if (!this.isDropdownOpen()) {
			this.openCustomDropdown();
		}

		this.optionsStore.appendSearchChar(char);
	}
}
