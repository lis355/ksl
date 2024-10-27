import lodash from "lodash";
import fs from "fs-extra";

class Base {
	constructor(source, options) {
		this.source = source;
		this.defaultValue = lodash.get(options, "defaultValue", {});
		this.serialize = lodash.get(options, "serialize");
		this.deserialize = lodash.get(options, "deserialize");
	}

	read() { }
	write() { }
}

export class FileSync extends Base {
	read() {
		if (fs.existsSync(this.source)) {
			try {
				const data = fs.readFileSync(this.source, "utf-8").trim();

				return data ? this.deserialize(data) : this.defaultValue;
			} catch (e) {
				if (e instanceof SyntaxError) {
					e.message = `Malformed JSON in file: ${this.source}\n${e.message}`;
				}

				throw e;
			}
		} else {
			fs.writeFileSync(this.source, this.serialize(this.defaultValue));

			return this.defaultValue;
		}
	}

	write(data) {
		return fs.writeFileSync(this.source, this.serialize(data));
	}
}

export class JsonFileSync extends FileSync {
	constructor(source, options) {
		options = options || {};

		lodash.set(options, "serialize", data => JSON.stringify(data, null, 2));
		lodash.set(options, "deserialize", data => JSON.parse(data));

		super(source, options);
	}
}

function isPromise(obj) {
	return !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
}

export function low(adapter) {
	const _ = lodash.runInContext();
	const db = _.chain({});

	_.prototype.write = _.wrap(_.prototype.value, function (func) {
		const funcRes = func.apply(this);
		return db.write(funcRes);
	});

	function plant(state) {
		db.__wrapped__ = state;
		return db;
	}

	db._ = _;

	db.read = () => {
		const r = adapter.read();
		return isPromise(r) ? r.then(plant) : plant(r);
	};

	db.write = returnValue => {
		const w = adapter.write(db.getState());
		return isPromise(w) ? w.then(() => returnValue) : returnValue;
	};

	db.getState = () => db.__wrapped__;

	db.setState = state => plant(state);

	return db.read();
}
