import EventEmitter from "events";

export default class MessageClient extends EventEmitter {
	handleMessage(data) {
		this.emit("message", data.message, data.data || {});
	}

	sendMessage(message, data = {}) { }
}
