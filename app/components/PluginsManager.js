import createPlugins from "../launcherPlugins/createPlugins.js";

export default class PluginsManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		await this.createPlugins();

		app.events.on(app.events.EVENT_TYPES.ELECTRON_APP_READY, this.handleElectronAppReady.bind(this));
	}

	async createPlugins() {
		this.plugins = createPlugins(this);

		await Promise.all(this.plugins.map(async plugin => plugin.load()));

		// this.plugins.forEach(plugin => { plugin.on(LauncherPlugin.OPTION, this.handlePluginOption.bind(this)); });
	}

	async handleElectronAppReady() {
		const optionsFileDirectory = app.path.dirname(app.optionsManager.optionsFilePath);
		for (const pluginOptions of app.optionsManager.options.plugins) {
			const pluginDirectory = app.path.resolve(optionsFileDirectory, pluginOptions.directory);

			let plugin;

			try {
				app.log.info(`[PluginsManager]: try to load plugin at ${pluginDirectory}`);

				const pluginPackage = app.fs.readJsonSync(app.path.resolve(pluginDirectory, "package.json"));

				const pluginPath = "file:///" + app.path.resolve(pluginDirectory, pluginPackage.main);

				const module = await import(pluginPath);

				const pluginClass = module.default;

				// TODO check pluginClass for functions	

				plugin = new pluginClass();

				if (plugin.load) await plugin.load();

				app.log.info(`[PluginsManager]: plugin at ${pluginDirectory} loaded`);

				// DEBUG
				const result = await plugin.execute();
				app.log.info(`[PluginsManager]: plugin executed ${result}`);
			} catch (error) {
				app.log.error(`[PluginsManager]: plugin can't load at ${pluginDirectory} with error: ${error.stack}`);
			}

			this.plugins.push(plugin);

			// if (pluginOptions.hotkey) {
			// 	app.hotkeysManager.register(pluginOptions.hotkey, () => {
			// 		plugin.execute();
			// 	});
			// }
		}
	}

	// TODO refactor
	input(str) {
		this.plugins.forEach(plugin => { plugin.input(str); });
	}
};
