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
			let pluginPath = app.path.resolve(optionsFileDirectory, pluginOptions.file);

			app.log.info(`[PluginsManager]: try to load plugin at ${pluginPath}`);

			// TODO refactor
			pluginPath = "file:///" + pluginPath;

			const module = await import(pluginPath);
			const pluginClass = module.default;

			// TODO check pluginClass for functions	

			const plugin = new pluginClass();

			await plugin.load();

			this.plugins.push(plugin);

			if (pluginOptions.hotkey) {
				app.hotkeysManager.register(pluginOptions.hotkey, () => {
					plugin.execute();
				});
			}
		}
	}

	// TODO refactor
	input(str) {
		this.plugins.forEach(plugin => { plugin.input(str); });
	}
};
