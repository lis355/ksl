import path from "node:path";

import { ELECTRON_APP_PATH } from "../constants.js";
import ApplicationComponent from "./ApplicationComponent.js";

export default class AssetsManager extends ApplicationComponent {
	assetPath(assetFile) {
		return path.join(ELECTRON_APP_PATH, "assets", assetFile || "");
	}
};
