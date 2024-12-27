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

import { ModalStore } from '../../store/modal.store';
import { ButtonComponent } from '../button.component';

@Component({
	selector: 'app-modal-outlet',
	templateUrl: './modal-outlet.component.html',
	styleUrl: './modal-outlet.component.scss',
	imports: [ButtonComponent],
	animations: [
		trigger('fadeAnimation', [
			state('visible', style({ 'background-color': '#0006' })),
			state('hidden', style({ 'background-color': '#0000' })),
			transition('hidden <=> visible', animate('{{duration}}ms ease-out')),
		]),
		trigger('slideAnimation', [
			state('visible', style({ transform: 'translateY(0)' })),
			state('hidden', style({ transform: 'translateY({{height}}px)' }), { params: { height: 0 } }),
			transition('hidden <=> visible', animate('{{duration}}ms ease-out')),
		]),
	],
})
export class ModalOutletComponent implements AfterViewInit {
	private readonly modalContainer = viewChild.required('modalContainer', { read: ElementRef });
	private readonly modalContent = viewChild.required('modalContent', { read: ViewContainerRef });

	private readonly modalStore = inject(ModalStore);

	readonly ANIMATION_DURATION_MS = 300;

	activeComponentRef: ComponentRef<unknown> | null = null;

	readonly modalState = signal<'hidden' | 'visible' | 'transitioning'>('hidden');
	readonly height = signal(10_000);
	readonly title = signal('');
	readonly isInTransition = signal(false);
	readonly animationParams = computed(() => {
		return { duration: this.ANIMATION_DURATION_MS, height: this.height() };
	});

	ngAfterViewInit() {
		this.modalStore.setContainer(this);
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
