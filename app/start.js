const ndapp = require("ndapp");

const components = [
	() => new (require("./components/UserDataManager"))(),
	() => new (require("./components/LocalDbManager"))(),
	() => new (require("./components/IconsManager"))(),
	() => new (require("./components/NotificationManager"))(),
	() => new (require("./components/KeystrokeLauncherManager"))(),
	() => new (require("./components/ElectronManager"))()
];

class AppManager extends ndapp.Application {
	constructor() {
		super();

		const errorHandler = error => {
			console.error(error.stack);
		};

		this.onUncaughtException = errorHandler;
		this.onUnhandledRejection = errorHandler;
	}

	get db() {
		return this.localDbManager.db;
	}

	async run() {
		await super.run();

		// app.log.info(await app.iconsManager.getIconInBase64(app.path.resolve(__dirname, "start.js")));

		// app.keystrokeLauncherManager.input("s");
	}
}

const DEVELOPER_ENVIRONMENT = Boolean(process.env.DEVELOPER_ENVIRONMENT);
const CWD = process.env.PORTABLE_EXECUTABLE_DIR || process.cwd();

ndapp({
	app: new AppManager(),
	components,
	libs: {},
	enums: {
		MESSAGE_TYPES: require("./constants/messageTypes")
	},
	constants: {
		DEVELOPER_ENVIRONMENT,
		CWD
	},
	specials: {
		info: require("./package.json"),
		events: require("./events")
	},
	log: {}
});
