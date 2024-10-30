import * as mathjs from "mathjs";

import LauncherPlugin from "./LauncherPlugin.js";
import QueryOption from "../components/queries/QueryOption.js";

export default class CalculatorLauncherPlugin extends LauncherPlugin {
	async load() {
		await super.load();

		this.icon = await app.iconsManager.loadIconFromFile(app.assetsManager.assetPath("calculator-icon.png"));
	}

	query(query, queryOptionsReceiver) {
		try {
			const result = mathjs.evaluate(query.text);
			if (Number.isFinite(result)) {
				const str = mathjs.format(result, { precision: 5 });
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
