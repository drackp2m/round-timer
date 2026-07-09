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
	private readonly coarsePointer = window.matchMedia('(pointer: coarse)').matches;

	private readonly interaction = new SelectInteractionHandler(this.store, {
		isInsideShell: (target) => this.shellElement?.contains(target) ?? false,
		getFocusElement: () => this.elementRef.nativeElement,
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
		this.nativeAdapter.ensurePlaceholder(this.placeholder());
		this.store.setOptionsFromSelect(this.elementRef.nativeElement);
		this.onNativeValueChange();
		this.createShell();
	}

	ngOnDestroy(): void {
		this.interaction.detachOutsideListeners();
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
		if (!this.coarsePointer) {
			this.nativeAdapter.focus();
		}

		if (this.store.isOpen()) {
			this.closeDropdown();

			return;
		}

		this.openDropdown();

		if (this.coarsePointer) {
			this.store.setFocused(true);
		}
	}

	private openDropdown(): void {
		this.store.openDropdown();
		this.interaction.attachOutsideListeners();
	}

	private closeDropdown(): void {
		this.store.closeDropdown();
		this.interaction.detachOutsideListeners();

		if (this.coarsePointer) {
			this.store.setFocused(false);
		}
	}

	private selectOption(value: string): void {
		this.nativeAdapter.applyValue(value);
		this.closeDropdown();
	}
}
