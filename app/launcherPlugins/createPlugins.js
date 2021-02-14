const FilesInDirectoryLauncherPlugin = require("./FilesInDirectoryLauncherPlugin");
const GoogleLauncherPlugin = require("./GoogleLauncherPlugin");
const YandexLauncherPlugin = require("./YandexLauncherPlugin");

module.exports = function (launcher) {
	const homeDirectory = app.os.homedir();
	const desktopDirectory = app.path.join(homeDirectory, "Desktop");

	return [
		new FilesInDirectoryLauncherPlugin(launcher, desktopDirectory),
		new GoogleLauncherPlugin(launcher),
		new YandexLauncherPlugin(launcher)
	];
};
