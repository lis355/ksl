import * as mathjs from "mathjs";

import LauncherPlugin from "./LauncherPlugin.js";
import QueryOption from "../components/queries/QueryOption.js";

export default class CalculatorLauncherPlugin extends LauncherPlugin {
	async load(pluginsManager) {
		this.icon = await pluginsManager.application.iconsManager.loadIconFromFile(pluginsManager.application.assetsManager.assetPath("calculator-icon.png"));
	}

	async unload() { }

	query(query, queryOptionsReceiver) {
		try {
			const result = mathjs.evaluate(query.text);
			if (Number.isFinite(result)) {
				const str = mathjs.format(result, { precision: 10 });
				if (str !== query.text) {
					queryOptionsReceiver(this, new QueryOption(
						query,
						"= " + str,
						{
							match: 1,
							icon: this.icon
						}
					));
				}
			}
		} catch (_) {
		}
	}

	execute(queryOption) { }
};
