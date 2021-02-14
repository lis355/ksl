const createPlugins = require("../launcherPlugins/createPlugins");

module.exports = class KeystrokeLauncherManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		await this.createPlugins();
	}

	async createPlugins() {
		this.plugins = createPlugins(this);

		await Promise.all(this.plugins.map(async plugin => plugin.load()));

		// this.plugins.forEach(plugin => { plugin.on(LauncherPlugin.OPTION, this.handlePluginOption.bind(this)); });
	}

	input(str) {
		this.currentInput = str;

		this.plugins.forEach(plugin => { plugin.input(str); });
	}

	handlePluginOption(option) {
		// if (option.input !== this.currentInput) return;

		// this.emit(LauncherPlugin.OPTION, option);
	}
};
