const EventEmitter = require("events");

const ndapp = require("ndapp");

class LauncherPlugin extends EventEmitter {
	constructor(launcher) {
		super();

		this.launcher = launcher;
	}

	input(str) { }

	emitOption(input, title, description) {
		this.emit(LauncherPlugin.OPTION, new LauncherPluginOption(this, input, title, description));
	}
}

class LauncherPluginOption {
	constructor(plugin, input, title, description) {
		this.plugin = plugin;
		this.input = input;

		this.title = title;
		this.description = description;
	}

	execute() { }
}

LauncherPlugin.OPTION = "OPTION";

class CalculatorPlugin extends LauncherPlugin {
	async input(str) {
		await app.tools.delay(300);

		this.emitOption(str, "RESULT" + str, "DESCR");
	}
}

class Launcher extends EventEmitter {
	constructor(plugins) {
		super();

		this.createPlugins();
	}

	createPlugins() {
		this.plugins = [
			new CalculatorPlugin(this)
		];

		this.plugins.forEach(plugin => { plugin.on(LauncherPlugin.OPTION, this.handlePluginOption.bind(this)); });
	}

	input(str) {
		this.currentInput = str;

		this.plugins.forEach(plugin => { plugin.input(str); });
	}

	handlePluginOption(option) {
		if (option.input !== this.currentInput) return;

		this.emit(LauncherPlugin.OPTION, option);
	}
}

ndapp(async () => {
	const launcher = new Launcher();

	launcher.on(LauncherPlugin.OPTION, option => app.log.info(option.title + " " + option.description));

	launcher.input("1 + 1");
	launcher.input("1 + 2");
});
