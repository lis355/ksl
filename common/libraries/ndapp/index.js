import EventEmitter from "node:events";
import os from "node:os";
import path from "node:path";

import _ from "lodash";
import fs from "fs-extra";

import { loggerCreator } from "./log.js";
import enumeration from "../enum/index.js";

class Application {
	constructor() {
		this.initialized = false;

		this.events = new EventEmitter();

		this.components = [];

		process.on("uncaughtException", error => { this.onUncaughtException(error); });
		process.on("unhandledRejection", error => { this.onUnhandledRejection(error); });

		const defaultErrorHandler = error => {
			if (this.log) {
				this.log.error(error.stack);
			} else {
				console.error(error);
			}

			this.quit();
		};

		this.onUncaughtException = defaultErrorHandler;
		this.onUnhandledRejection = defaultErrorHandler;
	}

	addComponent(component) {
		this.components.push(component);
		this[_.camelCase(component.constructor.name)] = component;
	}

	async initialize() {
		if (this.initialized) {
			app.log.error("Calling initialize twise or more");
		}

		for (let i = 0; i < this.components.length; i++) {
			await this.components[i].initialize();

			// app.log.info(`${this.components[i].constructor.name} initialized`);
		}

		this.initialized = true;
	}

	async run() {
		for (let i = 0; i < this.components.length; i++) {
			await this.components[i].run();

			// app.log.info(`${this.components[i].constructor.name} runned`);
		}
	}

	async quit(code = 0) {
		for (let i = 0; i < this.components.length; i++) {
			await this.components[i].exit(code);
		}

		this.exit(code);
	}

	get time() {
		return moment();
	}

	exit(code = 0) {
		process.exit(code);
	}
}

class ApplicationComponent {
	constructor() {
		this.initialized = false;

		this.events = new EventEmitter();
	}

	async initialize() {
		if (!this.initialized) {
			this.initialized = true;
		} else {
			app.log.error("Calling initialize twise or more");
		}
	}

	async run() { }

	async exit(code) { }
}

const defaultApp = {
	enums: {
	},
	constants: {
	},
	libs: {
		enum: enumeration
	},
	tools: {
	}
};

const defaultSpecials = {
	enum: defaultApp.libs.enum,
	moment: defaultApp.libs.moment,
	Application,
	ApplicationComponent
};

_.merge(defaultApp, {
	libs: {
		path,
		os,
		fs
	},
	tools: {
	}
});

_.merge(defaultSpecials, {
	path: defaultApp.libs.path,
	os: defaultApp.libs.os,
	fs: defaultApp.libs.fs
});

async function callCallback(application, options, name) {
	const callback = options[name];
	if (_.isFunction(callback)) {
		await callback.call(application);
	}
}

async function ndapp(options) {
	if (_.isFunction(options)) options = { onRun: options };

	options = options || {};

	const application = Object.assign(options.app || new ndapp.Application(), ndapp);
	await callCallback(application, options, "onCreate");

	global.app = application;

	application.log = loggerCreator(options.log);

	application.enums = {
		...application.enums,
		...options.enums
	};

	_.merge(application, {
		constants: options.constants,
		libs: options.libs,
		tools: options.tools
	});

	Object.assign(application, options.specials || {});

	(options.components || []).forEach(component => {
		component = _.isFunction(component) ? component() : component;
		application.addComponent(component);
	});

	await application.initialize();
	await callCallback(application, options, "onInitialize");

	await application.run();
	await callCallback(application, options, "onRun");
}

Object.assign(ndapp, defaultApp, defaultSpecials);
global.ndapp = ndapp;

export default ndapp;
