import { clipboard } from "electron";

import LauncherPlugin from "./LauncherPlugin.js";
import QueryOption from "../components/queries/QueryOption.js";

const ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()-_=+[{]};:,<.>?";

function generatePassword() {
	return Array.from({ length: 16 }).map(() => ALPH[Math.floor(Math.random() * ALPH.length)]).join("");
}

export default class PasswordGeneratorLauncherPlugin extends LauncherPlugin {
	async load() {
		await super.load();

		this.icon = await app.iconsManager.loadIconFromFile(app.assetsManager.assetPath("password-generator-icon.png"));
	}

	query(query, queryOptionsReceiver) {
		const queryTextLower = query.text.toLowerCase();
		if (queryTextLower.startsWith("genpass") ||
			queryTextLower.startsWith("passgen")) {
			queryOptionsReceiver(this, new QueryOption(
				query,
				generatePassword(),
				{
					description: "copy to clipboard",
					match: 1,
					icon: this.icon
				}
			));
		}
	}

	execute(queryOption) {
		clipboard.writeText(queryOption.text);
	}
};
