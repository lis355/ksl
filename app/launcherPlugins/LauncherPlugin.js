const EventEmitter = require("events");

const LauncherPluginOption = require("./LauncherPluginOption");

module.exports = class LauncherPlugin extends EventEmitter {
	constructor(launcher) {
		super();

		this.launcher = launcher;
	}

	async load() { }

	input(str) { }
	abort() { }

	emitOption(option) {
		// this.emit(LauncherPlugin.OPTION, new LauncherPluginOption(this, option));
	}

	async execute(option) { }
};
