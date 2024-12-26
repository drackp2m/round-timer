import { ComponentRef, Injectable, Type } from '@angular/core';

import { ModalOutletComponent } from '../../component/modal-outlet.component';

@Injectable({
	providedIn: 'root',
})
export class ModalService {
	private modalOutletComponent?: ModalOutletComponent;

	setContainer(component: ModalOutletComponent) {
		this.modalOutletComponent = component;
	}

	async show<T>(component: Type<T>): Promise<ComponentRef<T>> {
		if (!this.modalOutletComponent) {
			throw new Error('Modal container not initialized');
		}

		return this.modalOutletComponent.showComponent(component);
	}

	async clear() {
		if (this.modalOutletComponent) {
			await this.modalOutletComponent.close();
		}
	}
}
