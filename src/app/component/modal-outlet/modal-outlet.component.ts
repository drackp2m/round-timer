import { AnimationEvent, animate, state, style, transition, trigger } from '@angular/animations';
import {
	AfterViewInit,
	Component,
	ComponentRef,
	ElementRef,
	Type,
	ViewContainerRef,
	computed,
	inject,
	signal,
	viewChild,
} from '@angular/core';

import { ButtonDirective } from '@app/directive/button.directive';
import { ModalStore } from '@app/store/modal.store';

@Component({
	selector: 'app-modal-outlet',
	templateUrl: './modal-outlet.component.html',
	styleUrl: './modal-outlet.component.scss',
	imports: [ButtonDirective],
	animations: [
		trigger('slideAnimation', [
			state('visible', style({ transform: 'translateY(-{{distance}}px)' }), {
				params: { distance: 0 },
			}),
			state('hidden', style({ transform: 'translateY(0)' })),
			transition('hidden <=> visible', animate('{{duration}}ms {{easing}}')),
		]),
		trigger('fadeAnimation', [
			state('visible', style({ 'background-color': '#0006' })),
			state('hidden', style({ 'background-color': '#0000' })),
			transition('* <=> *', animate('{{duration}}ms {{easing}}')),
		]),
	],
})
export class ModalOutletComponent implements AfterViewInit {
	// Fixme => solve error when modal content change his height
	// Fixme => create class to ensure add title on modals and require it on open method
	private readonly modalContainer = viewChild.required('modalContainer', { read: ElementRef });
	private readonly modalContent = viewChild.required('modalContent', { read: ViewContainerRef });

	private readonly modalStore = inject(ModalStore);

	private readonly ANIMATION_DURATION_MS = 400;
	private readonly ANIMATION_EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)';

	activeComponentRef: ComponentRef<unknown> | null = null;

	readonly modalState = signal<'hidden' | 'visible' | 'transitioning'>('hidden');
	readonly height = signal(0);
	readonly title = signal('');
	readonly isInTransition = signal(false);
	readonly animationParams = computed(() => ({
		duration: this.ANIMATION_DURATION_MS,
		easing: this.ANIMATION_EASING,
		distance: this.height(),
	}));

	ngAfterViewInit() {
		this.modalStore.initializeContainer(this);
	}

	getModalContent(): ViewContainerRef {
		return this.modalContent();
	}

	async open<T>(title: string, component: Type<T>): Promise<ComponentRef<T>> {
		const modalContent = this.modalContent();
		const modalContainer = this.modalContainer();
		const animationInProgress = this.isInTransition();
		const modalState = this.modalState();

		if (!animationInProgress && 'visible' === modalState) {
			return Promise.reject('Modal is already open');
		}

		this.title.set(title);

		this.isInTransition.set(true);

		this.cleanupModal();

		const componentRef = modalContent.createComponent(component);
		this.activeComponentRef = componentRef;

		await new Promise<void>((resolve) => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					resolve();
				});
			});
		});

		this.height.set(modalContainer.nativeElement.offsetHeight);

		this.modalState.set('visible');

		return componentRef;
	}

	async close(): Promise<void> {
		const modalState = this.modalState();

		if ('visible' === modalState) {
			this.isInTransition.set(true);
			this.modalState.set('hidden');
		}
	}

	onAnimationDone(event: AnimationEvent): void {
		this.isInTransition.set(false);

		if ('hidden' === event.toState) {
			this.cleanupModal();
		}
	}

	private cleanupModal(): void {
		const modalContent = this.modalContent();

		if (this.activeComponentRef) {
			this.activeComponentRef?.destroy();
			this.activeComponentRef = null;
		}

		modalContent.clear();
	}
}
