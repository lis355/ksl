import isElectron from "is-electron";

import IpcMessageClient from "./IpcMessageClient.js";
import NoneMessageClient from "./NoneMessageClient.js";

function createMessageClient() {
	return isElectron()
		? new IpcMessageClient()
		: new NoneMessageClient();
}

let messageClient;

export default function getMessageClient() {
	if (!messageClient) messageClient = createMessageClient();

	return messageClient;
}
