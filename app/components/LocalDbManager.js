import { low, JsonFileSync } from "../../common/libraries/lowdb/index.js";

const DB_FILE_NAME = "db.json";

export default class LocalDbManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		this.db = low(new JsonFileSync(app.userDataManager.userDataPath(DB_FILE_NAME)));
		this.db
			.defaultsDeep({})
			.write();
	}
};
