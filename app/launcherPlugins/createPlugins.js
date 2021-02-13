const FilesInDirectoryLauncherPlugin = require("./FilesInDirectoryLauncherPlugin");

module.exports = function (launcher) {
	const homeDirectory = app.os.homedir();
	const desktopDirectory = app.path.join(homeDirectory, "Desktop");

	return [
		new FilesInDirectoryLauncherPlugin(launcher, desktopDirectory)
	];
};
