const LauncherPlugin = require("./LauncherPlugin");

module.exports = class FilesInDirectoryLauncherPlugin extends LauncherPlugin {
	constructor(launcher, directory) {
		super(launcher);

		this.directory = directory;
	}

	input(input) {
		for (const file of app.fs.readdirSync(this.directory).filter(file => file.toLowerCase().includes(input.toLowerCase()))) {
			this.emitOption(input, file, app.path.join(this.directory, file));
		}
	}

	// emitOption(input, title, description) {
	// 	this.emit(LauncherPlugin.OPTION, new LauncherPluginOption(this, input, title, description));
	// }
};
