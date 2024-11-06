import { EOL } from "node:os";
import { spawn } from "node:child_process";
import path from "node:path";

import _ from "lodash";
import { parse } from "shell-quote";
import electronBuilder from "electron-builder";
import fs from "fs-extra";

import loggerCreator from "./logger.js";

function log() {
	return log.logger || (log.logger = loggerCreator());
}

function clearDirSync(dir) {
	fs.removeSync(dir);
	fs.ensureDirSync(dir);
}

async function executeShellCommand({ cmd, cwd, env, onStdOutData, onStdErrData, onExit }) {
	return new Promise(resolve => {
		const parsedCmd = parse(cmd);
		const programm = parsedCmd[0];
		const args = parsedCmd.slice(1);

		const options = { shell: true };
		if (cwd) options.cwd = cwd;
		if (env) options.env = env;

		const child = spawn(programm, args, options);

		child.stdout.on("data", data => onStdOutData && onStdOutData(data));

		child.stderr.on("data", data => onStdErrData && onStdErrData(data));

		child.on("exit", code => {
			onExit && onExit();

			return resolve(code);
		});
	});
}

class Builder {
	async run() {
		this.repoDirectory = path.join(process.cwd(), "..");
		this.mainDirectory = path.join(this.repoDirectory, "app");
		this.rendererDirectory = path.join(this.repoDirectory, "ui");
		this.buildFilesDirectory = path.join(this.mainDirectory, "buildfiles");
		this.buildDirectory = path.join(this.mainDirectory, "build");

		clearDirSync(this.buildFilesDirectory);
		clearDirSync(this.buildDirectory);

		await this.buildLauncherBundle();
		await this.buildLauncherUI();
		this.copyAssets();
		this.createPackageFile();
		await this.buildElectron();
	}

	async buildLauncherBundle() {
		const exitCode = await executeShellCommand({
			cmd: "yarn run webpack --config webpack.config.js",
			cwd: this.mainDirectory,
			onStdOutData: data => {
				log().info(data.toString());
			},
			onStdErrData: data => {
				log().info(data.toString());
			}
		});

		if (exitCode !== 0) throw new Error("Can't build bot bundle");
	}

	async buildLauncherUI() {
		await executeShellCommand({
			cmd: "yarn run ui-build",
			cwd: this.rendererDirectory,
			onStdOutData: data => {
				log().info(data.toString());
			},
			onStdErrData: data => {
				log().info(data.toString());
			}
		});

		fs.copySync(path.join(this.rendererDirectory, "build"), path.join(this.buildFilesDirectory, "public"));
	}

	copyAssets() {
		fs.copySync(path.join(this.mainDirectory, "assets"), path.join(this.buildFilesDirectory, "assets"));
	}

	createPackageFile() {
		const packageFile = fs.readJsonSync("./package.json");
		const packageInfo = _.omit(packageFile, "build", "type", "scripts", "dependencies", "devDependencies");
		packageInfo.main = "app.bundle.js";
		packageInfo.description = packageInfo.name;

		fs.writeJsonSync(path.join(this.buildFilesDirectory, "package.json"), packageInfo);
	}

	async buildElectron() {
		const buildResult = await electronBuilder.build();

		log().info(buildResult.join(EOL));
	}
}

const builder = new Builder();
await builder.run();
