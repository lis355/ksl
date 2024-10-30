export default class Query {
	constructor(text) {
		this.text = text;
		this.id = app.tools.hash(this.text);
	}
}
