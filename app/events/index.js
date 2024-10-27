import EventEmitter from "events";

const eventEmitter = new EventEmitter();

const EVENT_TYPES = new ndapp.enum([
	"ELECTRON_APP_READY",
	"ELECTRON_APP_WILL_CLOSE"
]);

eventEmitter.EVENT_TYPES = EVENT_TYPES;

export default eventEmitter;
