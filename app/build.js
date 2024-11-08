import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import path from "node:path";

import _ from "lodash";
import { parse } from "shell-quote";
import electronBuilder from "electron-builder";
import fs from "fs-extra";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";

import loggerCreator from "./logger.js";

dayjs.extend(duration);

function log() {
	return log.logger || (log.logger = loggerCreator());
}

function clearDirSync(dir) {
	fs.removeSync(dir);
	fs.ensureDirSync(dir);
}

function getSha256(data) {
	return createHash("sha256").update(data).digest("hex");
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
		this.buildTime = dayjs();

		this.repoDirectory = path.join(process.cwd(), "..");
		this.mainDirectory = path.join(this.repoDirectory, "app");
		this.rendererDirectory = path.join(this.repoDirectory, "ui");
		this.buildFilesDirectory = path.join(this.mainDirectory, "buildfiles");
		this.buildDirectory = path.join(this.mainDirectory, "build");

		this.packageFile = fs.readJsonSync(path.join(this.mainDirectory, "package.json"));

		clearDirSync(this.buildFilesDirectory);
		clearDirSync(this.buildDirectory);

		await this.buildLauncherBundle();
		await this.buildLauncherUI();
		this.copyAssets();
		this.createPackageFile();
		await this.buildElectron();

		this.buildTime = dayjs() - this.buildTime;

		this.createInfo();
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

		this.buildExePath = buildResult.join();

		const exeData = fs.readFileSync(this.buildExePath);
		this.buildExeSize = exeData.length;
		this.buildSha256 = getSha256(fs.readFileSync(this.buildExePath));
	}

	createInfo() {
		const info = {
			node: process.versions.node,
			exe: this.buildExePath,
			size: this.buildExeSize,
			sha256: this.buildSha256,
			time: dayjs().toISOString(),
			buildTime: dayjs.duration(this.buildTime).toISOString()
		};

		const str = JSON.stringify(info, null, "\t");
		fs.writeFileSync(path.join(this.buildDirectory, "info.json"), str);
		log().info(str);

		spawn("explorer.exe", [this.buildDirectory]);
	}
}

const builder = new Builder();
await builder.run();
