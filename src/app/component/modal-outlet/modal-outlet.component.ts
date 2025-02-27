import { AnimationEvent, animate, state, style, transition, trigger } from '@angular/animations';
import {
	AfterViewInit,
	Component,
	ComponentRef,
	ElementRef,
	Renderer2,
	Type,
	ViewContainerRef,
	computed,
	inject,
	signal,
	viewChild,
} from '@angular/core';

import { ButtonDirective } from '@app/directive/button.directive';
import { Modal } from '@app/model/modal.model';
import { ModalStore } from '@app/store/modal.store';
import { Async } from '@app/util/async';

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
			transition('* <=> visible', animate('{{duration}}ms {{easing}}')),
		]),
		trigger('fadeAnimation', [
			state(
				'visible',
				style({
					'background-color': 'rgb(from var(--color-overlay) r g b / var(--opacity-overlay))',
					'backdrop-filter': 'blur(2px) grayscale(0.5)',
				}),
			),
			state(
				'hidden',
				style({
					'background-color': 'rgb(from var(--color-overlay) r g b / 0%)',
					'backdrop-filter': 'blur(0px) grayscale(0)',
				}),
			),
			transition('* <=> visible', animate('{{duration}}ms {{easing}}')),
		]),
	],
})
export class ModalOutletComponent implements AfterViewInit {
	// Fixme => solve error when modal content change his height
	private readonly modalContainer =
		viewChild.required<ElementRef<HTMLDivElement>>('modalContainer');
	private readonly modalContent = viewChild.required('modalContent', {
		read: ViewContainerRef,
	});

	private readonly modalStore = inject(ModalStore);
	private readonly renderer2 = inject(Renderer2);

	private readonly ANIMATION_DURATION_MS = 400;
	private readonly ANIMATION_EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)';

	activeComponentRef: ComponentRef<unknown> | null = null;

	readonly modalState = signal<'hidden' | 'transitioning' | 'visible'>('hidden');
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

	async open<T>(component: Type<Modal<T>>): Promise<ComponentRef<Modal<T>>> {
		this.modalState.set('transitioning');

		await Async.waitForFrames();

		const modalContent = this.modalContent();
		const modalContainer = this.modalContainer();
		const animationInProgress = this.isInTransition();
		const modalState = this.modalState();

		if (!animationInProgress && 'visible' === modalState) {
			return Promise.reject(new Error('Modal is already open'));
		}

		this.isInTransition.set(true);

		this.cleanupModal();

		const componentRef = modalContent.createComponent(component);
		this.activeComponentRef = componentRef;

		this.title.set(componentRef.instance.TITLE);
		this.renderer2.addClass(componentRef.location.nativeElement, 'modal');

		// ToDo => check if need for three
		await Async.waitForFrames(2);

		this.height.set(modalContainer.nativeElement.offsetHeight);

		this.modalState.set('visible');

		return componentRef;
	}

	close(): void {
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

		if (null !== this.activeComponentRef) {
			this.activeComponentRef.destroy();
			this.activeComponentRef = null;
		}

		modalContent.clear();
	}
}
