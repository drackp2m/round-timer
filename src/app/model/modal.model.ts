import { inject } from '@angular/core';

import { ModalStore } from '@app/store/modal.store';

export abstract class Modal {
	private readonly modalStore = inject(ModalStore);

	abstract TITLE: string;
	OVERLAY_CLOSABLE = true;

	close() {
		this.modalStore.close();
	}
}
