import { Notification } from "electron";

import ApplicationComponent from "./ApplicationComponent.js";

export default class NotificationManager extends ApplicationComponent {
	showNotification(text) {
		const notification = {
			title: "Keystroke launcher",
			body: text
		};

		new Notification(notification).show();
	}
};
