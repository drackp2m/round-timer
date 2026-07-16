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

	readonly notifications = this.notificationService.notifications;

	runAction(notification: AppNotification): void {
		notification.action?.callback();
		this.notificationService.dismiss(notification.uuid);
	}

	dismiss(notification: AppNotification): void {
		this.notificationService.dismiss(notification.uuid);
	}
}
