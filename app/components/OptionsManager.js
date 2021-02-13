const OPTIONS_BASE = {
	"runHotkey": "Ctrl + Alt + P",
	"startOnSystemStart": true,
	"plugins": []
};

module.exports = class OptionsManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		let success = false;
		if (app.fs.existsSync(this.optionsFilePath)) {
			try {
				this.options = app.tools.json.load(this.optionsFilePath);
				success = true;
			} catch (error) {
				app.log.error(error);
			}
		}

		if (!success) {
			this.options = app.libs._.cloneDeep(OPTIONS_BASE);

			this.save();
		}
	}

	get optionsFilePath() {
		const directory = app.constants.DEVELOPER_ENVIRONMENT ? app.userDataManager.userDataPath() : app.constants.CWD;

		return app.path.join(directory, "options.json");
	}

	save() {
		app.tools.json.save(this.optionsFilePath, this.options);
	}
};
