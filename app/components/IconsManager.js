import { PowerShell } from "node-powershell";
import fs from "fs-extra";

import ApplicationComponent from "./ApplicationComponent.js";
import hash from "../tools/hash.js";

function convertPathToWindowsStyle(path) {
	return path.join(path);
}

export default class IconsManager extends ApplicationComponent {
	async initialize() {
		await super.initialize();

		fs.ensureDirSync(this.application.userDataManager.tempPath());
	}

	async extractIconFromFile(filePath) {
		const filePathHash = hash(filePath);
		const dbPath = `cache.icons.${filePathHash}`;
		let icon = this.application.db.get(dbPath, null).value();
		if (icon) return icon;

		const ps = new PowerShell({
			executionPolicy: "Bypass",
			noProfile: true
		});

		const tempIconPngPath = this.application.userDataManager.tempPath(`${filePathHash}.png`);

		const cmd = PowerShell.command`
		Add-Type -AssemblyName System.Drawing;
		$Icon = [System.Drawing.Icon]::ExtractAssociatedIcon("${convertPathToWindowsStyle(filePath)}").ToBitmap().Save("${convertPathToWindowsStyle(tempIconPngPath)}");
		`;

		try {
			const result = await ps.invoke(cmd);
			if (result.stderr) throw new Error(result.stderr);

			icon = this.loadPngImageInBase64(tempIconPngPath);
			this.application.db.set(dbPath, icon).write();
			fs.removeSync(tempIconPngPath);
		} catch (error) {
			throw error;
		} finally {
			ps.dispose();
		}

		return icon;
	}

	loadPngImageInBase64(filePath) {
		return fs.readFileSync(filePath, { encoding: "base64" });
	}

	loadIconFromFile(filePath) {
		return this.loadPngImageInBase64(filePath);
	}
};
