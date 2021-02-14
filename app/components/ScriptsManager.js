module.exports = class ScriptsManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		app.events.on(app.events.EVENT_TYPES.ELECTRON_APP_READY, this.handleElectronAppReady.bind(this));
	}

	handleElectronAppReady() {
		app.optionsManager.options.scripts.forEach(scriptOptions => {
			const scriptClass = require(app.path.resolve(app.constants.CWD, scriptOptions.file));
			const script = new scriptClass();

			app.hotkeysManager.register(scriptOptions.hotkey, () => {
				script.execute();
			});
		});
	}
};
