module.exports = class AssetsManager extends ndapp.ApplicationComponent {
	assetPath(assetFile) {
		return app.path.join(app.constants.CWD, "assets", assetFile || "");
	}
};
