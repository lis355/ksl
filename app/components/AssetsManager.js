export default class AssetsManager extends ndapp.ApplicationComponent {
	assetPath(assetFile) {
		return app.path.join(app.constants.ELECTRON_APP_PATH, "assets", assetFile || "");
	}
};
