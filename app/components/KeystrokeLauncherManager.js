import Query from "./queries/Query.js";

export default class KeystrokeLauncherManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		this.handlePluginQueryOption = this.handlePluginQueryOption.bind(this);
	}

	input(str) {
		this.currentQuery = new Query(str);

		app.pluginsManager.plugins.forEach(plugin => plugin.query(this.currentQuery, this.handlePluginQueryOption));
	}

	handlePluginQueryOption(plugin, queryOption) {
		if (!this.currentQuery ||
			this.currentQuery.id !== queryOption.query.id) return;

		queryOption.pluginId = plugin.index;

		app.electronManager.sendQueryOption(queryOption);
	}

	execute(queryOption) {
		const plugin = app.pluginsManager.plugins[queryOption.pluginId];

		plugin.execute(queryOption);
	}
};
