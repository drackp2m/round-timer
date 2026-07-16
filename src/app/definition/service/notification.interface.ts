export interface NotificationAction {
	label: string;
	callback: () => void;
}

export interface AppNotification {
	uuid: string;
	message: string;
	action?: NotificationAction;
}
