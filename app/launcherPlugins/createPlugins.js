// import path from "node:path";

import CalculatorLauncherPlugin from "./CalculatorLauncherPlugin.js";
import PasswordGeneratorLauncherPlugin from "./PasswordGeneratorLauncherPlugin.js";
// import FilesInDirectoryLauncherPlugin from "./FilesInDirectoryLauncherPlugin.js";
// import GoogleLauncherPlugin from "./GoogleLauncherPlugin.js";
// import YandexLauncherPlugin from "./YandexLauncherPlugin.js";

export default function (pluginsManager) {
	// const homeDirectory = app.os.homedir();
	// const desktopDirectory = path.join(homeDirectory, "Desktop");

	return [
		new CalculatorLauncherPlugin(pluginsManager),
		new PasswordGeneratorLauncherPlugin(pluginsManager)
		// new FilesInDirectoryLauncherPlugin(launcher, desktopDirectory),
		// new GoogleLauncherPlugin(launcher),
		// new YandexLauncherPlugin(launcher)
	];
};
