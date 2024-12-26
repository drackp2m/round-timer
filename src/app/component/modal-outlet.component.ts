import { animate, state, style, transition, trigger } from '@angular/animations';
import {
	AfterViewInit,
	Component,
	ComponentRef,
	ElementRef,
	Type,
	ViewContainerRef,
	inject,
	signal,
	viewChild,
} from '@angular/core';

import { ModalService } from '../service/modal/modal.service';

@Component({
	selector: 'app-modal-outlet',
	template: `<div
		#modalContainer
		id="modal-outlet"
		[class.hidden]="!isVisible() && !isClosing()"
		[@slideAnimation]="{
			value: isVisible() ? 'visible' : 'hidden',
			params: { duration: ANIMATION_DURATION },
		}"
		[style.--modal-height.px]="dimensions().height"
		(@slideAnimation.done)="onAnimationDone()"
	>
		<ng-container #modalContent></ng-container>
	</div>`,
	styles: [
		`
			#modal-outlet {
				position: absolute;
				bottom: 0;
				width: 100%;
				background: var(--color-primary-mid);

				&.hidden {
					visibility: hidden;
					pointer-events: none;
				}
			}
		`,
	],
	animations: [
		trigger('slideAnimation', [
			state(
				'hidden',
				style({
					transform: 'translateY(var(--modal-height))',
				}),
			),
			state(
				'visible',
				style({
					transform: 'translateY(0)',
				}),
			),
			transition('hidden <=> visible', [animate('{{duration}}ms ease-out')]),
		]),
	],
})
export class ModalOutletComponent implements AfterViewInit {
	private readonly modalContainer = viewChild.required('modalContainer', { read: ElementRef });
	private readonly modalContent = viewChild.required('modalContent', { read: ViewContainerRef });

	private readonly modalService = inject(ModalService);

	readonly ANIMATION_DURATION = 300;

	readonly isVisible = signal(false);
	readonly isClosing = signal(false);
	readonly dimensions = signal({ width: 0, height: 0 });

	ngAfterViewInit() {
		this.modalService.setContainer(this);
	}

	async close(): Promise<void> {
		this.isClosing.set(true);
		this.isVisible.set(false);
	}

	onAnimationDone(): void {
		const isClosing = this.isClosing();
		console.log('onAnimationDone');

		if (isClosing) {
			this.modalContent().clear();
			this.isClosing.set(false);
		}
	}

	getModalContent(): ViewContainerRef {
		return this.modalContent();
	}

	async showComponent<T>(component: Type<T>): Promise<ComponentRef<T>> {
		const modalContent = this.modalContent();
		const modalContainer = this.modalContainer();

		modalContent.clear();
		this.isVisible.set(false);

		const componentRef = modalContent.createComponent(component);

		await new Promise((resolve) => setTimeout(resolve));

		const element = modalContainer.nativeElement;
		this.dimensions.set({ width: element.offsetWidth, height: element.offsetHeight });

		this.isVisible.set(true);

		return componentRef;
	}
}
