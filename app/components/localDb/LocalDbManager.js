import { low, JsonFileSync } from "./lowdb.js";
import ApplicationComponent from "../ApplicationComponent.js";

const DB_FILE_NAME = "db.json";

export default class LocalDbManager extends ApplicationComponent {
	async initialize() {
		await super.initialize();

		this.db = low(new JsonFileSync(this.application.userDataManager.userDataPath(DB_FILE_NAME)));
		this.db
			.defaultsDeep({})
			.write();
	}
};
