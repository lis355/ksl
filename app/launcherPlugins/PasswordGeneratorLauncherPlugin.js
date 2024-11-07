import LauncherPlugin from "./LauncherPlugin.js";
import QueryOption from "../components/queries/QueryOption.js";

const ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()-_=+[{]};:,<.>?";

function generatePassword() {
	return Array.from({ length: 16 }).map(() => ALPH[Math.floor(Math.random() * ALPH.length)]).join("");
}

export default class PasswordGeneratorLauncherPlugin extends LauncherPlugin {
	async load(pluginsManager) {
		this.pluginsManager = pluginsManager;

		this.icon = await pluginsManager.application.iconsManager.loadIconFromFile(pluginsManager.application.assetsManager.assetPath("password-generator-icon.png"));
	}

	async unload() { }

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
		this.pluginsManager.electron.clipboard.writeText(queryOption.text);
	}
};
