const Shell = require("node-powershell");

function convertPathToWindowsStyle(path) {
	return app.path.join(path);
}

module.exports = class IconsManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		app.fs.ensureDirSync(app.userDataManager.tempPath());
	}

	async getIconInBase64(filePath) {
		const filePathHash = app.tools.hash(filePath);
		let dbPath = `cache.icons.${filePathHash}`;
		let icon = app.db.get(dbPath, null).value();
		if (icon) return icon;

		const ps = new Shell({
			executionPolicy: "Bypass",
			noProfile: true
		});

		const tempIconPngPath = app.userDataManager.tempPath(`${filePathHash}.png`);

		const cmd = `
		Add-Type -AssemblyName System.Drawing;
		$Icon = [System.Drawing.Icon]::ExtractAssociatedIcon("${convertPathToWindowsStyle(filePath)}").ToBitmap().Save("${convertPathToWindowsStyle(tempIconPngPath)}");
		`;

		ps.addCommand(cmd);

		try {
			await ps.invoke();

			icon = app.fs.readFileSync(tempIconPngPath, { encoding: "base64" });
			app.db.set(dbPath, icon).write();
			app.fs.removeSync(tempIconPngPath);
		} catch (error) {
			app.log.error(error);

			ps.dispose();
		}

		return icon;
	}
};
