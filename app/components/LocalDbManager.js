const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const DB_FILE_NAME = "db.json";

module.exports = class LocalDbManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		const dbFileName = app.userDataManager.userDataPath(DB_FILE_NAME);
		const adapter = new FileSync(dbFileName);

		this.db = low(adapter);

		this.db
			.defaultsDeep({
				cache: {}
			})
			.write();
	}
};
