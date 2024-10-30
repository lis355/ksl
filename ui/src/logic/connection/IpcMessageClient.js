import EventEmitter from "events";

import MessageClient from "./MessageClient.js";

export default class IpcMessageClient extends MessageClient {
	constructor() {
		super();

		this.events = new EventEmitter();

		const { ipcRenderer } = require("electron");
		this.ipcRenderer = ipcRenderer;

		this.ipcRenderer.on("message", (event, message) => {
			// console.log("UI IpcMessageClient.handleMessage", message);

			this.events.emit("message", message);
		});
	}

	subscribeOnMessage(messageHandler) {
		this.events.on("message", messageHandler);
	}

	unsubscribeOnMessage(messageHandler) {
		this.events.off("message", messageHandler);
	}

	sendMessage(message) {
		// console.log("UI IpcMessageClient.sendMessage", message);

		this.ipcRenderer.send("message", message);
	}
};
