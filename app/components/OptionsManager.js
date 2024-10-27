import _ from "lodash";
import fs from "fs-extra";

const OPTIONS_BASE = {
	"runHotkey": "Ctrl + Alt + P",
	"startOnSystemStart": true,
	"plugins": []
};

export default class OptionsManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		let success = false;
		if (app.fs.existsSync(this.optionsFilePath)) {
			try {
				this.options = fs.readJsonSync(this.optionsFilePath);
				success = true;
			} catch (error) {
				app.log.error(error);
			}
		}

		if (!success) {
			this.options = _.cloneDeep(OPTIONS_BASE);

			this.save();
		}
	}

	get optionsFilePath() {
		const directory = app.isDevelopment ? app.userDataManager.userDataPath() : app.constants.CWD;

		return app.path.join(directory, "options.json");
	}

	save() {
		fs.outputJsonSync(this.optionsFilePath, this.options);
	}
};
