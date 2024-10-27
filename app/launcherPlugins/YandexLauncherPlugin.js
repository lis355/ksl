import { shell } from "electron";
import querystring from "querystring";

import LauncherPlugin from "./LauncherPlugin.js";

export default class GoogleLauncherPlugin extends LauncherPlugin {
	async load() {
		await super.load();

		this.icon = app.iconsManager.loadPngIconInBase64(app.assetsManager.assetPath("yandex-icon.png"));
	}

	input(input) {
		if (input.toLowerCase().startsWith("ya ")) {

		}
	}

	// emitOption(input, title, description) {
	// 	this.emit(LauncherPlugin.OPTION, new LauncherPluginOption(this, input, title, description));
	// }

	async execute(option) {
		shell.openExternal(`https://yandex.ru/search/?${querystring.stringify({ text: "q w e *** ///" })}`);
	}
};
