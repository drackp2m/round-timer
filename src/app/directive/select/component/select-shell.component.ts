import { NgTemplateOutlet } from '@angular/common';
import {
	Component,
	ElementRef,
	TemplateRef,
	afterNextRender,
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

	private readonly viewportService = inject(ViewportService);
	private readonly wrapper = viewChild<ElementRef<HTMLElement>>('wrapper');
	private readonly labelText = viewChild<ElementRef<HTMLElement>>('labelText');

	constructor() {
		afterNextRender(() => {
			this.applySizeVariables();
		});

		effect(() => {
			this.store.isOpen();
			this.viewportService.routerOutletScroll();
			this.viewportService.windowResized();

			this.positionTop.set(this.isPositionedTop());
		});
	}

	onWrapperPointerDown(event: PointerEvent): void {
		if (null !== (event.target as HTMLElement).closest('.app-select-options')) {
			return;
		}

		event.preventDefault();
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
