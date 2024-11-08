import path from "node:path";
import os from "node:os";

import _ from "lodash";
import * as stackTrace from "stack-trace";
import ansi from "ansi-escape-sequences";
import dayjs from "dayjs";
import Enum from "@lis355/enumjs";
import fs from "fs-extra";

const LOG_LEVELS = new Enum([
	"INFO",
	"WARNING",
	"ERROR"
]);

class Logger {
	constructor(logsHistoryLength = 0) {
		this.logsHistoryLength = logsHistoryLength;
		this.messages = [];
		this.listeners = [];

		for (const { key: level } of LOG_LEVELS) {
			this[_.lowerCase(level)] = (...objects) => this.log(level, objects.map(obj => obj.toString()).join(" "));
		}
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

		if (this.logsHistoryLength > 0) {
			this.messages.push(message);

			while (this.messages.length > this.logsHistoryLength) this.messages.shift();
		}

		this.listeners.forEach(callback => callback(message));
	}

	addListener(callback) {
		if (!this.listeners.includes(callback)) this.listeners.push(callback);
	}

	removeListener(callback) {
		var index = this.listeners.indexOf(callback);
		if (index > -1) this.listeners.splice(index, 1);
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

		fs.ensureDirSync(path.dirname(logPath));
		fs.removeSync(logPath);

		this.logStream = fs.createWriteStream(logPath, { flags: "a" });
	}

	handleMessage(message) {
		this.logStream.write(`[${message.level} | ${getMessageTextDate(message)}]: ${message.text} (${getTraceInfo()})${os.EOL}`);
	}
};

export default function loggerCreator(options) {
	options = options || {};

	const logger = new Logger(options.logsHistoryLength);

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
