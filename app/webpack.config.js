const path = require("path");

const TerserPlugin = require("terser-webpack-plugin");

const SOURCE_DIR = process.cwd();
const BUILD_DIR = path.join(process.cwd(), "buildfiles");

const config = {
	mode: "production",
	target: "electron-main",
	entry: path.join(SOURCE_DIR, "bot-launcher-start.js"),
	output: {
		path: BUILD_DIR,
		filename: "launcher.bundle.js"
	},
	module: {
		rules: []
	},
	externals: [
		"uws"
	],
	plugins: [
	],
	optimization: {
		minimize: false,
		minimizer: [
			new TerserPlugin({
				extractComments: false
			})
		]
	}
};

module.exports = config;
