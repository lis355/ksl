import path from "node:path";

import { USER_DATA_PATH } from "../constants.js";
import ApplicationComponent from "./ApplicationComponent.js";
import fs from "fs-extra";

import log from "../log.js";

export default class UserDataManager extends ApplicationComponent {
	async initialize() {
		await super.initialize();

		fs.ensureDirSync(this.userDataPath());

		log().info(`[UserDataManager]: userDataPath ${this.userDataPath()}`);
	}

	userDataPath(nextPath) {
		return path.join(USER_DATA_PATH, nextPath || "");
	}

	tempPath(nextPath) {
		return path.join(this.userDataPath(), "temp", nextPath || "");
	}
};
