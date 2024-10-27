export default class Enum {
	constructor(values) {
		let all;
		let keys;
		if (Array.isArray(values)) {
			all = values.map(value => value.toString());
			all.forEach(value => { this[value] = value; });
			keys = all;
		} else if (typeof values === "object") {
			all = [];
			keys = Object.keys(values);
			keys.forEach(key => {
				const value = values[key];
				all.push(value);
				this[key] = value;
			});
		} else {
			throw new Error("Values can be array or object");
		}

		if (new Set(all).size !== all.length) throw new Error("There are duplicates in array");

		Object.defineProperty(this, "all", {
			get: () => {
				return [...all];
			}
		});

		Object.defineProperty(this, "keys", {
			get: () => {
				return [...keys];
			}
		});

		Object.defineProperty(this, "length", {
			get: () => {
				return all.length;
			}
		});

		const proxy = new Proxy(this, {
			get(target, property) {
				if (property in target) {
					return target[property];
				}

				throw new Error(`Enum '${property}' is not defined`);
			},
			set(target, property) {
				throw new Error("You can't set properties on enums");
			}
		});

		return proxy;
	}

	toString() {
		return "Enum";
	}
};
