const EventEmitter = require("events");

const eventEmitter = new EventEmitter();

const EVENT_TYPES = new ndapp.enum([
	"ELECTRON_APP_READY",
	"ELECTRON_APP_WILL_CLOSE"
]);

eventEmitter.EVENT_TYPES = EVENT_TYPES;

module.exports = eventEmitter;
