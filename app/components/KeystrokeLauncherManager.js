import Query from "./queries/Query.js";

import ApplicationComponent from "./ApplicationComponent.js";

import log from "../log.js";

export default class KeystrokeLauncherManager extends ApplicationComponent {
	async initialize() {
		await super.initialize();

		this.handlePluginQueryOption = this.handlePluginQueryOption.bind(this);
	}

	input(str) {
		this.currentQuery = new Query(str);

		this.application.pluginsManager.plugins.forEach(plugin => {
			// if (plugin.constructor.name === "") debugger;

			plugin.query(this.currentQuery, this.handlePluginQueryOption);
		});
	}

	handlePluginQueryOption(plugin, queryOption) {
		if (!this.currentQuery ||
			this.currentQuery.id !== queryOption.query.id) return;

		queryOption.pluginId = plugin.index;

		// log().info("[KeystrokeLauncherManager]: queryOption", JSON.stringify(queryOption));

		this.application.electronManager.sendQueryOption(queryOption);
	}

	execute(queryOption) {
		const plugin = this.application.pluginsManager.plugins[queryOption.pluginId];

		// log().info(`[KeystrokeLauncherManager]: plugin ${plugin.constructor.name} execute queryOption`, JSON.stringify(queryOption));

		plugin.execute(queryOption);
	}
};
