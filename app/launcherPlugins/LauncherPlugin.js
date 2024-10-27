import EventEmitter from "events";

// import LauncherPluginOption from "./LauncherPluginOption";

export default class LauncherPlugin extends EventEmitter {
	constructor(launcher) {
		super();

		this.launcher = launcher;
	}

	async load() { }

	input(str) { }
	abort() { }

	emitOption(option) {
		app.log.info("LauncherPlugin.emitOption", option);
		// this.emit(LauncherPlugin.OPTION, new LauncherPluginOption(this, option));
	}

	async execute(option) { }
};
