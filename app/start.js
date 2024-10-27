const ndapp = require("ndapp");

const components = [
	() => new (require("./components/UserDataManager"))(),
	() => new (require("./components/AssetsManager"))(),
	() => new (require("./components/LocalDbManager"))(),
	() => new (require("./components/OptionsManager"))(),
	() => new (require("./components/IconsManager"))(),
	() => new (require("./components/NotificationManager"))(),
	() => new (require("./components/KeystrokeLauncherManager"))(),
	() => new (require("./components/ElectronManager"))(),
	() => new (require("./components/HotkeysManager"))(),
	() => new (require("./components/ScriptsManager"))()
];

class AppManager extends ndapp.Application {
	constructor() {
		super();

		const errorHandler = error => {
			if (app &&
				app.log) {
				app.log.error(error.stack);
			} else {
				console.error(error.stack);
			}
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
const CWD = process.cwd();

global.isDevelopment = DEVELOPER_ENVIRONMENT;

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
	log: {
		file: DEVELOPER_ENVIRONMENT ? false : ndapp.path.join(CWD, "log.txt")
	}
});
