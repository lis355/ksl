import fs from "fs-extra";

import ndapp from "../common/libraries/ndapp/index.js";

import AssetsManager from "./components/AssetsManager.js";
import ElectronManager from "./components/ElectronManager.js";
import HotkeysManager from "./components/HotkeysManager.js";
import IconsManager from "./components/IconsManager.js";
import KeystrokeLauncherManager from "./components/KeystrokeLauncherManager.js";
import LocalDbManager from "./components/LocalDbManager.js";
import NotificationManager from "./components/NotificationManager.js";
import OptionsManager from "./components/OptionsManager.js";
import PluginsManager from "./components/PluginsManager.js";
import UserDataManager from "./components/UserDataManager.js";

import MESSAGE_TYPES from "../common/enums/messageTypes.js";

import events from "./events/index.js";

import hash from "./tools/hash.js";

const { name, version } = fs.readJsonSync("./package.json");

const CWD = process.cwd();
const DEVELOPER_ENVIRONMENT = process.env.DEVELOPER_ENVIRONMENT === "true";

const LOG_DIRECTORY = ndapp.path.join(CWD, "logs");
const LOG_PATH = ndapp.path.join(LOG_DIRECTORY, /*dayjs().format("DD-MM-YYYY HH-mm-ss")*/"log" + ".txt");

const LOCAL_APP_DATA_PATH = ndapp.path.join(process.env.LOCALAPPDATA, name);
// const USER_DATA_PATH = ndapp.path.join(CWD, "userData");
const USER_DATA_PATH = ndapp.path.join(LOCAL_APP_DATA_PATH, "userData");

fs.ensureDirSync(LOG_DIRECTORY);

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

	get isDevelopment() {
		return DEVELOPER_ENVIRONMENT;
	}

	async initialize() {
		fs.ensureDirSync(LOCAL_APP_DATA_PATH);
		fs.ensureDirSync(USER_DATA_PATH);

		app.log.info(`${name} v${version}`);
		app.log.info(`LOCAL_APP_DATA_PATH ${LOCAL_APP_DATA_PATH}`);
		app.log.info(`USER_DATA_PATH ${USER_DATA_PATH}`);

		await super.initialize();
	}

	async run() {
		await super.run();

		if (app.isDevelopment) {
			try {
				const onRunFilePath = app.path.join(CWD, "onRun.js");
				if (app.fs.existsSync(onRunFilePath)) await import(`file://${onRunFilePath}`);
			} catch (error) {
				console.error(error);
			}
		}
	}
}

ndapp({
	app: new AppManager(),
	components: [
		() => new UserDataManager(),
		() => new AssetsManager(),
		() => new LocalDbManager(),
		() => new OptionsManager(),
		() => new IconsManager(),
		() => new NotificationManager(),
		() => new KeystrokeLauncherManager(),
		() => new ElectronManager(),
		() => new HotkeysManager(),
		() => new PluginsManager()
	],
	log: {
		file: LOG_PATH
	},
	enums: {
		MESSAGE_TYPES
	},
	constants: {
		CWD,
		USER_DATA_PATH,
		LOCAL_APP_DATA_PATH
	},
	libs: {
	},
	tools: {
		hash
	},
	specials: {
		name,
		version,

		events
	}
});
