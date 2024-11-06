import EventEmitter from "node:events";

export default class ApplicationComponent {
	constructor(application) {
		this.application = application;
		this.initialized = false;

		this.events = new EventEmitter();
	}

	async initialize() {
		if (!this.initialized) this.initialized = true;
		else throw new Error("Calling initialize twise or more");
	}

	async run() { }

	async exit(code) { }
}
