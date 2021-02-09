module.exports = class UserDataManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		app.fs.ensureDirSync(this.userDataPath());
	}

	userDataPath(nextPath) {
		return app.path.join(app.constants.CWD, "userData", nextPath || "");
	}

	tempPath(nextPath) {
		return app.path.join(this.userDataPath(), "temp", nextPath || "");
	}
};
