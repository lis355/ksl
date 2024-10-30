import { PowerShell } from "node-powershell";

function convertPathToWindowsStyle(path) {
	return app.path.join(path);
}

export default class IconsManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		app.fs.ensureDirSync(app.userDataManager.tempPath());
	}

	async extractIconFromFile(filePath) {
		const filePathHash = app.tools.hash(filePath);
		const dbPath = `cache.icons.${filePathHash}`;
		let icon = app.db.get(dbPath, null).value();
		if (icon) return icon;

		const ps = new PowerShell({
			executionPolicy: "Bypass",
			noProfile: true
		});

		const tempIconPngPath = app.userDataManager.tempPath(`${filePathHash}.png`);

		const cmd = PowerShell.command`
		Add-Type -AssemblyName System.Drawing;
		$Icon = [System.Drawing.Icon]::ExtractAssociatedIcon("${convertPathToWindowsStyle(filePath)}").ToBitmap().Save("${convertPathToWindowsStyle(tempIconPngPath)}");
		`;

		try {
			const result = await ps.invoke(cmd);
			if (result.stderr) throw new Error(result.stderr);

			icon = this.loadPngImageInBase64(tempIconPngPath);
			app.db.set(dbPath, icon).write();
			app.fs.removeSync(tempIconPngPath);
		} catch (error) {
			throw error;
		} finally {
			ps.dispose();
		}

		return icon;
	}

	loadPngImageInBase64(filePath) {
		return app.fs.readFileSync(filePath, { encoding: "base64" });
	}

	loadIconFromFile(filePath) {
		return this.loadPngImageInBase64(filePath);
	}
};
