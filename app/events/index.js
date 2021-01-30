const EventEmitter = require("events");

const eventEmitter = new EventEmitter();

const EVENT_TYPES = new ndapp.enum([
	"MESSAGE_INPUT"
]);

eventEmitter.EVENT_TYPES = EVENT_TYPES;

module.exports = eventEmitter;
