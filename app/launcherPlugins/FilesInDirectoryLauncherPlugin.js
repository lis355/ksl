import path from "node:path";

import fs from "fs-extra";

import LauncherPlugin from "./LauncherPlugin.js";

export default class FilesInDirectoryLauncherPlugin extends LauncherPlugin {
	constructor(pluginsManager, directory) {
		super(pluginsManager);

		this.directory = directory;
	}

	input(input) {
		for (const file of fs.readdirSync(this.directory).filter(file => file.toLowerCase().includes(input.toLowerCase()))) {
			this.emitOption(input, file, path.join(this.directory, file));
		}
	}

	// emitOption(input, title, description) {
	// 	this.emit(LauncherPlugin.OPTION, new LauncherPluginOption(this, input, title, description));
	// }
};
