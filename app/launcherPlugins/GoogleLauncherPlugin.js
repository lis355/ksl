import { shell } from "electron";
import querystring from "querystring";

import LauncherPlugin from "./LauncherPlugin.js";

export default class GoogleLauncherPlugin extends LauncherPlugin {
	async load() {
		await super.load();

		this.icon = app.iconsManager.loadPngIconInBase64(app.assetsManager.assetPath("google-icon.png"));
	}

	input(input) {
		if (input.toLowerCase().startsWith("g ")) {

		}
	}

	// emitOption(input, title, description) {
	// 	this.emit(LauncherPlugin.OPTION, new LauncherPluginOption(this, input, title, description));
	// }

	async execute(option) {
		shell.openExternal(`https://www.google.com/search?${querystring.stringify({ q: option.query })}`);
	}
};
