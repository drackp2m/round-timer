import { ComponentRef, Injectable, Type } from '@angular/core';
import { signalStore, withState } from '@ngrx/signals';

import { ModalOutletComponent } from '../component/modal-outlet/modal-outlet.component';

interface ModalStoreProps {
	isOpen: boolean;
	isInTransition: boolean;
}

const initialState: ModalStoreProps = {
	isOpen: false,
	isInTransition: false,
};

@Injectable({
	providedIn: 'root',
})
export class ModalStore extends signalStore({ protectedState: false }, withState(initialState)) {
	private modalOutletComponent: ModalOutletComponent | null = null;

	constructor() {
		super();
	}

	setContainer(modalOutletComponent: ModalOutletComponent) {
		this.modalOutletComponent = modalOutletComponent;
	}

	async open<T>(component: Type<T>): Promise<ComponentRef<T>> {
		if (!this.modalOutletComponent) {
			throw new Error('Modal container not initialized');
		}

		return this.modalOutletComponent.open('Create new participant', component);
	}

	async close() {
		await this.modalOutletComponent?.close();
	}
}
