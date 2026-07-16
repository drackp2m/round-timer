import { Injectable, signal } from '@angular/core';

import {
	AppNotification,
	NotificationAction,
} from '@app/definition/service/notification.interface';

interface NotifyOptions {
	action?: NotificationAction;
	timeout?: number | null;
}

const READING_BASE_DURATION = 1500;
const READING_DURATION_PER_WORD = 300;
const MIN_READING_DURATION = 4000;

@Injectable({
	providedIn: 'root',
})
export class NotificationService {
	private readonly notificationList = signal<AppNotification[]>([]);

	readonly notifications = this.notificationList.asReadonly();

	notify(message: string, options: NotifyOptions = {}): string {
		const notification: AppNotification =
			undefined === options.action
				? { uuid: crypto.randomUUID(), message }
				: { uuid: crypto.randomUUID(), message, action: options.action };

		this.notificationList.update((notifications) => [...notifications, notification]);

		const timeout =
			undefined === options.timeout ? this.getReadingDuration(message) : options.timeout;

		if (null !== timeout) {
			setTimeout(() => {
				this.dismiss(notification.uuid);
			}, timeout);
		}

		return notification.uuid;
	}

	dismiss(uuid: string): void {
		this.notificationList.update((notifications) =>
			notifications.filter((notification) => uuid !== notification.uuid),
		);
	}

	private getReadingDuration(message: string): number {
		const wordCount = message.trim().split(/\s+/u).length;

		return Math.max(
			MIN_READING_DURATION,
			READING_BASE_DURATION + wordCount * READING_DURATION_PER_WORD,
		);
	}
}
