import { Notification } from "electron";

export default class NotificationManager extends ndapp.ApplicationComponent {
	showNotification(text) {
		const notification = {
			title: "Keystroke launcher",
			body: text
		};

		new Notification(notification).show();
	}
};
