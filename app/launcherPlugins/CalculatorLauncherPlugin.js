import * as mathjs from "mathjs";

import LauncherPlugin from "./LauncherPlugin.js";

export default class CalculatorLauncherPlugin extends LauncherPlugin {
	// async load() {
	// 	await super.load();

	// 	this.icon = app.iconsManager.loadPngIconInBase64(app.assetsManager.assetPath("google-icon.png"));
	// }

	input(input) {
		try {
			const result = mathjs.evaluate(input);
			this.emitOption(result);
		} catch (error) {

		}
	}
};
