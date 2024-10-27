export default class UserDataManager extends ndapp.ApplicationComponent {
	userDataPath(nextPath) {
		return app.path.join(app.constants.USER_DATA_PATH, nextPath || "");
	}

	tempPath(nextPath) {
		return app.path.join(this.userDataPath(), "temp", nextPath || "");
	}
};
