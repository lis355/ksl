import MessageClient from "./MessageClient.js";

// NOTE https://stackoverflow.com/questions/48148021/how-to-import-ipcrenderer-in-react
// cause create react app doesn't work if we use import
const { ipcRenderer } = require("electron-better-ipc");

export default class IpcClient extends MessageClient {
	constructor() {
		super();

		// const { ipcRenderer } = require("electron-better-ipc");
		this.ipc = ipcRenderer;

		this.ipc.answerMain("message", this.handleMessage.bind(this));

		// import("electron-better-ipc").then(ipcRenderer => {
		// 	// TODO import
		// 	// const { ipcRenderer: ipc } = require("electron-better-ipc");
		// 	this.ipc = ipcRenderer;//ipc;

		// 	this.ipc.answerMain("message", this.handleMessage.bind(this));
		// });
	}

	handleMessage(data) {
		if (process.env.NODE_ENV === "development") console.log("IpcClient.handleMessage", data);

		super.handleMessage(data);
	}

	sendMessage(message, data = {}) {
		if (process.env.NODE_ENV === "development") console.log("IpcClient.sendMessage", message, data);

		this.ipc.callMain("message", { message, data });
	}
};
