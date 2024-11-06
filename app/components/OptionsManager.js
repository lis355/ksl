import path from "node:path";

import _ from "lodash";
import Enum from "@lis355/enumjs";
import fs from "fs-extra";

import ApplicationComponent from "./ApplicationComponent.js";
import ElectronManager from "./ElectronManager.js";

import log from "../log.js";

const OPTIONS_BASE = {
	"runHotkey": "Ctrl + Alt + P",
	"startOnSystemStart": true,
	"plugins": []
};

const EVENT_TYPES = new Enum([
	"OPTIONS_CHANGED"
]);

export default class OptionsManager extends ApplicationComponent {
	async initialize() {
		await super.initialize();

		const optionsFilePath = this.optionsFilePath;
		log().info(`[OptionsManager]: optionsFilePath ${optionsFilePath}`);

		if (!this.tryLoadOptions()) this.save();

		fs.watch(optionsFilePath, _.debounce(this.handleOptionsFileChanged.bind(this), 500, { leading: false }));

		this.application.electronManager.events.on(ElectronManager.EVENT_TYPES.ELECTRON_APP_READY, this.handleElectronManagerOnElectronAppReady.bind(this));
	}

	get optionsFilePath() {
		return path.join(this.application.userDataManager.userDataPath(), "options.json");
	}

	tryLoadOptions() {
		if (fs.existsSync(this.optionsFilePath)) {
			try {
				this.options = fs.readJsonSync(this.optionsFilePath);

				return true;
			} catch (error) {
				log().error(error);

				this.options = _.cloneDeep(OPTIONS_BASE);
			}
		}

		Object.freeze(this.options);

		return false;
	}

	save() {
		fs.outputJsonSync(this.optionsFilePath, this.options);
	}

	handleOptionsFileChanged() {
		this.tryLoadOptions();

		this.events.emit(EVENT_TYPES.OPTIONS_CHANGED);
	}

	handleElectronManagerOnElectronAppReady() {
		this.events.emit(EVENT_TYPES.OPTIONS_CHANGED);
	}
}

OptionsManager.EVENT_TYPES = EVENT_TYPES;
