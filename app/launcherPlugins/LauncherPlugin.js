import EventEmitter from "events";

export default class LauncherPlugin extends EventEmitter {
	async load(pluginsManager) { }
	async unload() { }

	query(query, queryOptionsReceiver) { }
	execute(queryOption) { }
};
