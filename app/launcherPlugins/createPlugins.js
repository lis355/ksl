import CalculatorLauncherPlugin from "./CalculatorLauncherPlugin.js";
import PasswordGeneratorLauncherPlugin from "./PasswordGeneratorLauncherPlugin.js";
// import FilesInDirectoryLauncherPlugin from "./FilesInDirectoryLauncherPlugin.js";
// import GoogleLauncherPlugin from "./GoogleLauncherPlugin.js";
// import YandexLauncherPlugin from "./YandexLauncherPlugin.js";

export default function (launcher) {
	// const homeDirectory = app.os.homedir();
	// const desktopDirectory = app.path.join(homeDirectory, "Desktop");

	return [
		new CalculatorLauncherPlugin(launcher),
		new PasswordGeneratorLauncherPlugin(launcher)
		// new FilesInDirectoryLauncherPlugin(launcher, desktopDirectory),
		// new GoogleLauncherPlugin(launcher),
		// new YandexLauncherPlugin(launcher)
	];
};
