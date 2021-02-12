module.exports = class LauncherPluginOption {
	constructor(plugin, input, title, description) {
		this.plugin = plugin;
		this.input = input;

		this.title = title;
		this.description = description;
	}

	execute() { }
};
