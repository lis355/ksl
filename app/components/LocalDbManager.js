const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const { encrypt, decrypt } = require("../tools/textCrypt");

const DB_FILE_NAME = app.constants.DEVELOPER_ENVIRONMENT ? "db.json" : "db.data";
const getDbDefaults = () => ({});

module.exports = class LocalDbManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		const systemId = await app.common.tools.getSystemId();

		const developSerialization = {
			serialize: app.tools.json.format,
			deserialize: app.tools.json.parse
		};

		const defaultSerialization = {
			serialize: data => encrypt(app.tools.json.format(data, null), systemId),
			deserialize: data => {
				try {
					return app.tools.json.parse(decrypt(data, systemId));
				} catch (error) {
					return getDbDefaults();
				}
			}
		};

		const serialization = app.constants.DEVELOPER_ENVIRONMENT ? developSerialization : defaultSerialization;

		const dbFileName = app.userDataManager.userDataPath(DB_FILE_NAME);
		const adapter = new FileSync(dbFileName, serialization);

		this.db = low(adapter);

		this.db
			.defaultsDeep(getDbDefaults())
			.write();
	}
};
