import EventEmitter from "events";

import MessageClient from "./MessageClient.js";

export default class IpcMessageClient extends MessageClient {
	constructor() {
		super();

		this.events = new EventEmitter();

		// NOTE https://stackoverflow.com/questions/48148021/how-to-import-ipcrenderer-in-react
		// cause create react app doesn't work if we use import
		const { ipcRenderer } = require("electron-better-ipc");
		this.ipc = ipcRenderer;

		this.ipc.answerMain("message", message => {
			if (window.isDevelopment) console.log("UI IpcMessageClient.handleMessage", message);

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
		if (window.isDevelopment) console.log("UI IpcMessageClient.sendMessage", message);

		this.ipc.callMain("message", message);
	}
};
