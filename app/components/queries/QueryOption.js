export default class QueryOption {
	constructor(query, text, meta = { match, description, icon }) {
		this.query = query;
		this.text = text;
		this.meta = meta;
	}
}
