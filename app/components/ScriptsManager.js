module.exports = class ScriptsManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		app.events.on(app.events.EVENT_TYPES.ELECTRON_APP_READY, this.handleElectronAppReady.bind(this));
	}

	handleElectronAppReady() {
		app.optionsManager.options.plugins.forEach(pluginOptions => {
			const pluginClass = require(app.path.resolve(app.constants.CWD, pluginOptions.file));
			const plugin = new pluginClass();

			app.hotkeysManager.register(pluginOptions.hotkey, () => {
				plugin.execute();
			});
		});
	}
};
