const { globalShortcut } = require("electron");

module.exports = class HotkeysManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		app.events.on(app.events.EVENT_TYPES.ELECTRON_APP_READY, this.handleElectronAppReady.bind(this));
		app.events.on(app.events.EVENT_TYPES.ELECTRON_APP_WILL_CLOSE, this.handleElectronAppWillClose.bind(this));
	}

	handleElectronAppReady() {
		globalShortcut.register(app.optionsManager.options.runHotkey, () => {
			app.electronManager.showWindowIfNotVisible();
		});
	}

	handleElectronAppWillClose() {
		this.unregisterAllHotkeys();
	}

	unregisterAllHotkeys() {
		globalShortcut.unregisterAll();
	}

	register(hotkey, action) {
		globalShortcut.register(hotkey, action);
	}

	unregister(hotkey) {
		globalShortcut.unregister(hotkey);
	}
};
