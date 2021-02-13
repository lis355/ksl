const path = require("path");

const SOURCE_DIR = process.cwd();
const BUILD_DIR = path.join(process.cwd(), "buildfiles");

const config = {
	mode: "production",
	target: "electron-main",
	entry: path.join(SOURCE_DIR, "start.js"),
	output: {
		path: BUILD_DIR,
		filename: "app.bundle.js"
	},
	module: {
		rules: []
	},
	externals: [
	],
	plugins: [
	],
	optimization: {
		minimize: false
	}
};

module.exports = config;
