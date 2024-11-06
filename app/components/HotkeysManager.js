import { globalShortcut } from "electron";

import ApplicationComponent from "./ApplicationComponent.js";
import ElectronManager from "./ElectronManager.js";
import OptionsManager from "./OptionsManager.js";

export default class HotkeysManager extends ApplicationComponent {
	async initialize() {
		await super.initialize();

		this.application.electronManager.events.on(ElectronManager.EVENT_TYPES.ELECTRON_APP_WILL_CLOSE, this.handleElectronManagerOnElectronAppWillClose.bind(this));
		this.application.optionsManager.events.on(OptionsManager.EVENT_TYPES.OPTIONS_CHANGED, this.handleOptionsManagerOnOptionsChanged.bind(this));
	}

	handleElectronManagerOnElectronAppWillClose() {
		this.unregisterAllHotkeys();
	}

	handleOptionsManagerOnOptionsChanged() {
		this.unregisterAllHotkeys();

		globalShortcut.register(this.application.optionsManager.options.runHotkey, () => {
			this.application.electronManager.showWindowIfNotVisible();
		});
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
