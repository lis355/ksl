import path from "node:path";

import fs from "fs-extra";

import ApplicationComponent from "./ApplicationComponent.js";
import createPlugins from "../launcherPlugins/createPlugins.js";
import ElectronManager from "./ElectronManager.js";

import log from "../log.js";

export default class PluginsManager extends ApplicationComponent {
	async initialize() {
		await super.initialize();

		this.plugins = [];

		await this.createPlugins();

		this.application.electronManager.events.on(ElectronManager.EVENT_TYPES.ELECTRON_APP_READY, this.handleElectronAppReady.bind(this));
	}

	async createPlugins() {
		const plugins = createPlugins(this);

		await Promise.all(plugins.map(async plugin => plugin.load()));

		for (const plugin of plugins) this.addPlugin(plugin);
	}

	async handleElectronAppReady() {
		// TODO
		// await this.createUserPlugins();
	}

	async createUserPlugins() {
		const optionsFileDirectory = path.dirname(this.application.optionsManager.optionsFilePath);
		for (const pluginOptions of this.application.optionsManager.options.plugins) {
			const pluginDirectory = path.resolve(optionsFileDirectory, pluginOptions.directory);

			let plugin;

			try {
				log().info(`[PluginsManager]: try to load plugin at ${pluginDirectory}`);

				const pluginPackage = fs.readJsonSync(path.resolve(pluginDirectory, "package.json"));

				const pluginPath = "file:///" + path.resolve(pluginDirectory, pluginPackage.main);

				const module = await import(pluginPath);

				const pluginClass = module.default;

				// TODO check pluginClass for functions	

				plugin = new pluginClass();

				if (plugin.load) await plugin.load();

				log().info(`[PluginsManager]: plugin at ${pluginDirectory} loaded`);
			} catch (error) {
				log().error(`[PluginsManager]: plugin can't load at ${pluginDirectory} with error: ${error.stack}`);
			}

			this.addPlugin(plugin);

			// if (pluginOptions.hotkey) {
			// 	app.hotkeysManager.register(pluginOptions.hotkey, () => {
			// 		plugin.execute();
			// 	});
			// }
		}
	}

	addPlugin(plugin) {
		plugin.index = this.plugins.length;

		this.plugins.push(plugin);
	}
};
