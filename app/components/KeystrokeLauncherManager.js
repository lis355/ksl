
export default class KeystrokeLauncherManager extends ndapp.ApplicationComponent {
	input(str) {
		this.currentInput = str;

		app.pluginsManager.input(this.currentInput);
	}

	handlePluginOption(option) {
		// if (option.input !== this.currentInput) return;

		// this.emit(LauncherPlugin.OPTION, option);
	}
};
