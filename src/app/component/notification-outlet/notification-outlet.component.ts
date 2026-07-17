import { Component, inject } from '@angular/core';

import { AppNotification } from '@app/definition/service/notification.interface';
import { ButtonDirective } from '@app/directive/button.directive';
import { NotificationService } from '@app/service/notification.service';

@Component({
	selector: 'app-notification-outlet',
	templateUrl: './notification-outlet.component.html',
	styleUrl: './notification-outlet.component.scss',
	imports: [ButtonDirective],
})
export class NotificationOutletComponent {
	private readonly notificationService = inject(NotificationService);
	private readonly finishedLeaveAnimations = new Map<string, number>();

	readonly notifications = this.notificationService.notifications;

	runAction(notification: AppNotification): void {
		notification.action?.callback();
		this.notificationService.dismiss(notification.uuid);
	}

	dismiss(notification: AppNotification): void {
		this.notificationService.dismiss(notification.uuid);
	}

	onCountdownEnd(notification: AppNotification): void {
		this.notificationService.dismiss(notification.uuid);
	}

	onWrapperAnimationEnd(notification: AppNotification, event: AnimationEvent): void {
		const isLeaveAnimation =
			event.animationName.endsWith('notification-close') ||
			event.animationName.endsWith('notification-leave');

		if (!notification.leaving || !isLeaveAnimation) {
			return;
		}

		const finishedCount = (this.finishedLeaveAnimations.get(notification.uuid) ?? 0) + 1;

		if (2 > finishedCount) {
			this.finishedLeaveAnimations.set(notification.uuid, finishedCount);

			return;
		}

		this.finishedLeaveAnimations.delete(notification.uuid);
		this.notificationService.remove(notification.uuid);
	}
}
