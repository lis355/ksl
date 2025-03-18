import path from "node:path";

import fs from "fs-extra";

import Application from "./Application.js";

import AssetsManager from "./components/AssetsManager.js";
import ElectronManager from "./components/ElectronManager.js";
import HotkeysManager from "./components/HotkeysManager.js";
import IconsManager from "./components/IconsManager.js";
import KeystrokeLauncherManager from "./components/KeystrokeLauncherManager.js";
import LocalDbManager from "./components/localDb/LocalDbManager.js";
import NotificationManager from "./components/NotificationManager.js";
import OptionsManager from "./components/OptionsManager.js";
import PluginsManager from "./components/PluginsManager.js";
import UserDataManager from "./components/UserDataManager.js";

import {
	APPLICATION_NAME,
	APPLICATION_VERSION,
	BUILD_EXE_PATH,
	CWD,
	DEVELOPER_ENVIRONMENT,
	ELECTRON_APP_PATH,
	LOCAL_APP_DATA_PATH,
	LOG_PATH
} from "./constants.js";

import log from "./log.js";

class App extends Application {
	constructor() {
		super();

		const errorHandler = error => {
			if (typeof log === "function") {
				log().error(error.stack);
			} else {
				console.error(error.stack);
			}
		};

		this.onUncaughtException = errorHandler;
		this.onUnhandledRejection = errorHandler;

		this.addComponent(new UserDataManager(this));
		this.addComponent(new AssetsManager(this));
		this.addComponent(new LocalDbManager(this));
		this.addComponent(new OptionsManager(this));
		this.addComponent(new IconsManager(this));
		this.addComponent(new NotificationManager(this));
		this.addComponent(new KeystrokeLauncherManager(this));
		this.addComponent(new ElectronManager(this));
		this.addComponent(new HotkeysManager(this));
		this.addComponent(new PluginsManager(this));
	}

	get db() {
		return this.localDbManager.db;
	}

	get isDevelopment() {
		return DEVELOPER_ENVIRONMENT;
	}

	async initialize() {
		log().info(`${APPLICATION_NAME} v${APPLICATION_VERSION}`);

		log().info(`CWD ${CWD}`);
		log().info(`BUILD_EXE_PATH ${BUILD_EXE_PATH}`);
		log().info(`ELECTRON_APP_PATH ${ELECTRON_APP_PATH}`);
		log().info(`LOCAL_APP_DATA_PATH ${LOCAL_APP_DATA_PATH}`);
		log().info(`LOG_PATH ${LOG_PATH}`);

		await super.initialize();
	}

	async run() {
		await super.run();

		if (this.isDevelopment) {
			try {
				const onRunFilePath = path.join(CWD, "onRun.js");
				if (fs.existsSync(onRunFilePath)) await (await import(`file:///${onRunFilePath}`)).default(this);
			} catch (error) {
				console.error(error);
			}
		}
	}
}

const app = new App();
await app.initialize();
await app.run();
