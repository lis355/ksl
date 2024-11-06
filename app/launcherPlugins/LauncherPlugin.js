import EventEmitter from "events";

export default class LauncherPlugin extends EventEmitter {
	constructor(pluginsManager) {
		super();

		this.pluginsManager = pluginsManager;
	}

	async load() { }

	query(query, queryOptionsReceiver) { }
	execute(queryOption) { }
};
