import MessageClient from "./MessageClient.js";

export default class NoneMessageClient extends MessageClient {
	subscribeOnMessage(messageHandler) {
		console.warn("[MOCK]:", "NoneMessageClient.subscribeOnMessage");
	}

	unsubscribeOnMessage(messageHandler) {
		console.warn("[MOCK]:", "NoneMessageClient.unsubscribeOnMessage");
	}

	sendMessage(message) {
		console.warn("[MOCK]:", "NoneMessageClient.sendMessage", message);
	}
}
