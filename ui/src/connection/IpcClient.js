import EventEmitter from "events";

import isElectron from "is-electron";

class Client extends EventEmitter {
	handleMessage(data) {
		this.emit("message", data.message, data.data || {});
	}

	sendMessage(message, data = {}) { }
}

class IpcClient extends Client {
	constructor() {
		super();

		const { ipcRenderer: ipc } = require("electron-better-ipc");
		this.ipc = ipc;

		ipc.answerMain("data", this.handleMessage.bind(this));
	}

	sendMessage(message, data = {}) {
		this.ipc.callMain("data", { message, data });
	}
};

window.ipcClient = isElectron() ? new IpcClient() : new Client();
