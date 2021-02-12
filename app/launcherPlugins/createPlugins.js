const { getDesktopFolder } = require("platform-folders");

const FilesInDirectoryLauncherPlugin = require("./FilesInDirectoryLauncherPlugin");

module.exports = function (launcher) {
	return [
		new FilesInDirectoryLauncherPlugin(launcher, getDesktopFolder())
	];
};
