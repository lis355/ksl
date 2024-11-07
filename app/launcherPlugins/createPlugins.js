import CalculatorLauncherPlugin from "./CalculatorLauncherPlugin.js";
import PasswordGeneratorLauncherPlugin from "./PasswordGeneratorLauncherPlugin.js";

export default function () {
	return [
		new CalculatorLauncherPlugin(),
		new PasswordGeneratorLauncherPlugin()
	];
};
