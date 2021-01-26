module.exports = class UserDataManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		app.fs.ensureDirSync(this.userDataPath());
	}

	applicationUserDataPath() {
		return app.path.join(app.constants.APPLICATION_DATA_PATH, "userData");
	}

	userDataPath(nextPath) {
		const userData = app.path.join(this.applicationUserDataPath(), "launcher");
		return app.path.join(userData, nextPath || "");
	}

	tempPath(nextPath) {
		return app.path.join(this.userDataPath(), "temp", nextPath || "");
	}
};
