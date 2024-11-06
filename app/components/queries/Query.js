import hash from "../../tools/hash.js";

export default class Query {
	constructor(text) {
		this.text = text;
		this.id = hash(this.text);
	}
}
