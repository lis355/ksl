import path from "node:path";

import fs from "fs-extra";
import electron from "electron";

import ApplicationComponent from "./ApplicationComponent.js";
import createPlugins from "../launcherPlugins/createPlugins.js";
import OptionsManager from "./OptionsManager.js";

import log from "../log.js";

export default class PluginsManager extends ApplicationComponent {
	async initialize() {
		await super.initialize();

		this.electron = electron;

		this.plugins = [];

		this.application.optionsManager.events.on(OptionsManager.EVENT_TYPES.OPTIONS_CHANGED, this.handleOptionsManagerOnOptionsChanged.bind(this));
	}

	async handleOptionsManagerOnOptionsChanged() {
		await Promise.all(this.plugins.map(async plugin => {
			try {
				await plugin.unload();
			} catch (error) {
				log().error(`[PluginsManager]: plugin ${plugin.constructor.name} can't unload with error: ${error.stack}`);
			}
		}));

		await this.createAndLoadPlugins(this);
	}

	async createAndLoadPlugins() {
		const plugins = createPlugins(this);
		await Promise.all(plugins.map(async plugin => plugin.load(this)));

		const userPlugins = await this.createAndLoadUserPlugins();

		this.plugins = [...plugins, ...userPlugins].map((plugin, index) => {
			plugin.index = index;

			return plugin;
		});
	}

	async createAndLoadUserPlugins() {
		const optionsFileDirectory = path.dirname(this.application.optionsManager.optionsFilePath);

		const userPlugins = await Promise.all(this.application.optionsManager.options.plugins.map(async pluginOptions => this.createAndLoadUserPlugin(pluginOptions, optionsFileDirectory)));
		const loadedUserPlugins = userPlugins.filter(Boolean);

		return loadedUserPlugins;
	}

	async createAndLoadUserPlugin(pluginOptions, optionsFileDirectory) {
		let pluginDirectory;
		try {
			pluginDirectory = path.isAbsolute(pluginOptions.directory)
				? pluginOptions.directory
				: path.resolve(optionsFileDirectory, pluginOptions.directory);
		} catch (error) {
			log().error(`[PluginsManager]: plugin options error, no directory: ${error.stack}`);

			return null;
		}

		try {
			log().info(`[PluginsManager]: try to load plugin at ${pluginDirectory}`);

			const pluginPackage = fs.readJsonSync(path.resolve(pluginDirectory, "package.json"));

			const pluginPath = "file://" + path.resolve(pluginDirectory, pluginPackage.main);

			// https://webpack.js.org/api/module-methods/#dynamic-expressions-in-import
			const module = await import(/* webpackIgnore: true */ pluginPath);

			const pluginClass = module.default;

			let plugin = new pluginClass();

			if (typeof plugin.load !== "function" ||
				typeof plugin.unload !== "function" ||
				typeof plugin.query !== "function" ||
				typeof plugin.execute !== "function") throw new error("Plugin doesn't have all functions");

			await plugin.load(this);

			log().info(`[PluginsManager]: plugin ${plugin.constructor.name} loaded`);

			return plugin;
		} catch (error) {
			log().error(`[PluginsManager]: plugin can't load at ${pluginDirectory} with error: ${error.message}`);
		}

		return null;
	}
};
