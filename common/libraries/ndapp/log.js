import path from "node:path";
import os from "node:os";

import _ from "lodash";
import * as stackTrace from "stack-trace";
import ansi from "ansi-escape-sequences";
import dayjs from "dayjs";
import fs from "fs-extra";

import Enum from "../enum/index.js";

const LOG_LEVELS = new Enum([
	"INFO",
	"WARNING",
	"ERROR"
]);

const LOGS_HISTORY_MAX_LENGTH = 50;

class Logger {
	constructor(logsHistoryMaxLength = LOGS_HISTORY_MAX_LENGTH) {
		this.logsHistoryMaxLength = logsHistoryMaxLength;
		this.messages = [];
		this.listeners = [];

		LOG_LEVELS.all.forEach(level => {
			this[_.lowerCase(level)] = (...objects) => this.log(level, objects.map(obj => obj.toString()).join(" "));
		});

		this.groups = new Set((process.env.NDAPP_LOG_DEBUG || "").split(",").map(name => name.trim()).filter(Boolean));
	}

	get history() {
		return this.messages;
	}

	log(level, text) {
		level = level || LOG_LEVELS.INFO;
		text = text || "";

		const time = dayjs().valueOf();

		text = text.toString();

		const message = {
			time,
			level,
			text
		};

		this.messages.push(message);

		while (this.messages.length > this.logsHistoryMaxLength) this.messages.shift();

		this.listeners.forEach(callback => callback(message));
	}

	addListener(callback) {
		if (!this.listeners.includes(callback)) this.listeners.push(callback);
	}

	removeListener(callback) {
		var index = this.listeners.indexOf(callback);
		if (index > -1) this.listeners.splice(index, 1);
	}

	useLogs(group) {
		if (!group) return false;
		if (this.groups.has("*")) return true;
		return this.groups.has(group);
	}
}

function getMessageTextDate(message) {
	return dayjs(message.time).format("DD.MM.YYYY HH:mm:ss:SSS");
}

function getTraceInfo(depth = 6) {
	const trace = stackTrace.get();

	const functionName = trace[depth].getFunctionName();
	const fileName = trace[depth].getFileName();
	const lineNumber = trace[depth].getLineNumber();
	const columnNumber = trace[depth].getColumnNumber();

	return `${functionName} at ${fileName}:${lineNumber}:${columnNumber}`;
}

class LoggerConsoleListener {
	handleMessage(message) {
		let headerColor;
		switch (message.level) {
			case LOG_LEVELS.INFO: headerColor = "brightGreen"; break;
			case LOG_LEVELS.WARNING: headerColor = "brightYellow"; break;
			case LOG_LEVELS.ERROR: headerColor = "brightRed"; break;
		}

		const text = `${ansi.styles(headerColor)}[${message.level} | ${getMessageTextDate(message)}]: ${ansi.rgb(204, 204, 204)}${message.text} ${ansi.styles("grey")}(${getTraceInfo()})${ansi.styles("reset")}`;
		const processor = message.level === LOG_LEVELS.ERROR ? console.error : console.log;
		processor(text);
	}
}

class LoggerFileListener {
	constructor(logPath) {
		logPath = logPath || path.join(process.cwd(), "log.txt");

		app.fs.ensureDirSync(path.dirname(logPath));
		app.fs.removeSync(logPath);

		this.logStream = fs.createWriteStream(logPath, { flags: "a" });
	}

	handleMessage(message) {
		const text = `[${message.level} | ${getMessageTextDate(message)}")}]: ${message.text} (${getTraceInfo()})`;
		this.logStream.write(text + os.EOL);
	}
};

export function loggerCreator(options) {
	options = options || {};

	const logger = new Logger(options.logsHistoryMaxLength);

	const loggerConsoleListener = new LoggerConsoleListener();
	logger.addListener(loggerConsoleListener.handleMessage.bind(loggerConsoleListener));

	if (options.file) {
		if (options.file === true) options.file = null;

		const loggerFileListener = new LoggerFileListener(options.file);
		logger.addListener(loggerFileListener.handleMessage.bind(loggerFileListener));
	}

	logger.LOG_LEVELS = LOG_LEVELS;

	return logger;
}
