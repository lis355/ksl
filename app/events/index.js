const EventEmitter = require("events");

const eventEmitter = new EventEmitter();

const EVENT_TYPES = new ndapp.enum([
	"INTERNET_ERROR",
	"DOWNLOAD_PROGRESS",

	"USER_SETTLED",
	"SUBSCRIPTION_SETTLED",

	"BUNDLE_READY",

	"LAUNCHER_UI_CONNECTED",
	"LAUNCHER_UI_DISCONNECTED",

	"BOT_UI_CONNECTED",
	"BOT_UI_DISCONNECTED",

	"BOT_PROCESS_SPAWNED",
	"BOT_PROCESS_EXITED",

	"BOT_CONNECTED",
	"BOT_DISCONNECTED",

	"USER_AND_SUBSCRIPTION_UPDATED"
]);

eventEmitter.EVENT_TYPES = EVENT_TYPES;

module.exports = eventEmitter;
