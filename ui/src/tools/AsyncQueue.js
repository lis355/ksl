export default class AsyncQueue {
	constructor() {
		this.clear();

		this.process = this.process.bind(this);
	}

	clear() {
		this.processing = false;
		this.queue = [];
	}

	push(asyncFunction) {
		return new Promise(resolve => {
			this.queue.push({ asyncFunction, resolve });

			setTimeout(this.process, 0);
		});
	}

	get length() {
		return this.queue.length;
	}

	async process() {
		if (this.processing ||
			this.length === 0) return;

		this.processing = true;

		const { asyncFunction, resolve } = this.queue.shift();

		try {
			resolve(await asyncFunction());
		} catch (error) {
			console.error(error);
		}

		this.processing = false;

		setTimeout(this.process, 0);
	}
};
