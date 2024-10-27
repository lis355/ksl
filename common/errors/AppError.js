import EventEmitter from "node:events";

import stackTraceParser from "stacktrace-parser";

import { BASE_ERRORS, errors as baseErrors } from "./baseErrors.js";

const errors = {};

const IGNORE_STACK_METHODS = ["processTicksAndRejections", "runMicrotasks"];

class AppError extends Error {
	constructor(message, data = {}) {
		super(message);

		AppError.initialize(this, message, data, AppError.parseStack(this.stack));
	}

	static createFromError(error, message, data = {}) {
		if (!error) return new AppError(message, data);

		return AppError.initialize(Object.create(AppError.prototype), message, { message: error.message, ...data }, AppError.parseStack(error.stack));
	}

	static initialize(error, message, data, stack) {
		app.libs._.assign(error, {
			message,
			data,
			stack,
			meta: {}
		});

		AppError.events.emit("errorCreated", error);

		return error;
	}

	serialize() {
		return {
			message: this.message,
			data: this.data,
			stack: this.stack
		};
	}

	static parseStack(stack) {
		if (!stack) return [];
		if (app.libs._.isArray(stack)) return stack;

		const frames = stackTraceParser.parse(stack)
			.map(frame => ({
				method: frame.methodName,
				file: frame.file,
				line: frame.lineNumber,
				column: frame.column
			}))
			.filter(frame => !IGNORE_STACK_METHODS.includes(frame.method));

		return frames;
	}

	static defineErrors(newErrors) {
		for (const errorInfo of Object.entries(newErrors)) {
			if (!AppError.errors[errorInfo[0]]) {
				AppError.errors[errorInfo[0]] = errorInfo[1];
			} else {
				throw new AppError(BASE_ERRORS.LOGIC_ERROR);
			}
		}
	}

	static isAppError(error) {
		return error instanceof AppError;
	}

	static parse(error = {}) {
		if (AppError.isAppError(error)) return error;

		return AppError.createFromError(error, BASE_ERRORS.UNKNOWN_FAIL);
	}

	static format(error) {
		error = AppError.parse(error);

		const errorInfo = AppError.errors[error.message];
		const message = app.libs._.isFunction(errorInfo) ? errorInfo(error) : errorInfo;

		return message;
	}

	static formatStack(error) {
		// return error.stack.map(frame => frame.method).join(ndapp.os.EOL);
		return error.stack.map(frame => `  ${frame.method} (${frame.file}:${frame.line}:${frame.column})`).join(ndapp.os.EOL);
	}

	static formatWithStack(error) {
		error = AppError.parse(error);

		return [
			AppError.format(error),
			error.message,
			app.tools.yaml.format(error.data),
			"Stack: " + ndapp.os.EOL + AppError.formatStack(error)
		].join(ndapp.os.EOL);
	}

	static async passFunction(asyncFunctionWithErrors, errors, asyncErrorCallback) {
		try {
			const result = await asyncFunctionWithErrors();
			return result;
		} catch (error) {
			const err = AppError.parse(error);
			if (errors.includes(err.message)) {
				app.log.info(AppError.format(err));

				let result;
				if (asyncErrorCallback) {
					result = await asyncErrorCallback(error);
				}

				return result;
			}

			throw error;
		}
	}
};

AppError.errors = errors;
AppError.defineErrors(baseErrors);

AppError.events = new EventEmitter();

export default AppError;
