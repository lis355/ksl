import EventEmitter from "events";

import Enum from "@lis355/enumjs";

const eventEmitter = new EventEmitter();

const EVENT_TYPES = new Enum([
	"ELECTRON_APP_READY",
	"ELECTRON_APP_WILL_CLOSE"
]);

eventEmitter.EVENT_TYPES = EVENT_TYPES;

export default eventEmitter;
