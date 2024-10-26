import isElectron from "is-electron";

import IpcClient from "./IpcClient.js";
import MessageClient from "./MessageClient.js";

export default function createMessageClient() {
	return isElectron() ? new IpcClient() : new MessageClient();
}
