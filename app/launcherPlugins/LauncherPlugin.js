import EventEmitter from "events";

export default class LauncherPlugin extends EventEmitter {
	constructor(launcher) {
		super();

		this.launcher = launcher;
	}

	async load() { }

	query(query, queryOptionsReceiver) { }
	execute(queryOption) { }
};
