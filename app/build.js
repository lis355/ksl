const { spawn } = require("child_process");

const ndapp = require("ndapp");
const builder = require("electron-builder");
const { parse } = require("shell-quote");

const info = require("./package.json");

function clearDirSync(dir) {
	app.fs.removeSync(dir);
	app.fs.ensureDirSync(dir);
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

class App extends ndapp.Application {
	async run() {
		await super.run();

		this.repoDirectory = app.path.join(process.cwd(), "..");
		this.mainDirectory = app.path.join(this.repoDirectory, "app");
		this.rendererDirectory = app.path.join(this.repoDirectory, "ui");
		this.buildFilesDirectory = app.path.join(this.mainDirectory, "buildfiles");
		this.buildDirectory = app.path.join(this.mainDirectory, "build");

		clearDirSync(this.buildFilesDirectory);
		clearDirSync(this.buildDirectory);

		await this.buildLauncherBundle();
		await this.buildLauncherUI();
		this.createPackageFile();
		await this.buildElectron();
		this.copyAssets();

		app.log.info(`Build ${info.name} v${info.version} successful`);
	}

	async buildLauncherBundle() {
		const exitCode = await executeShellCommand({
			cmd: "yarn run webpack --config webpack.config.js",
			cwd: this.mainDirectory,
			onStdOutData: data => {
				app.log.info(data.toString());
			},
			onStdErrData: data => {
				app.log.info(data.toString());
			}
		});

		if (exitCode !== 0) throw new Error("Can't build bot bundle");
	}

	async buildLauncherUI() {
		await executeShellCommand({
			cmd: "yarn run build-electron",
			cwd: this.rendererDirectory,
			onStdOutData: data => {
				app.log.info(data.toString());
			},
			onStdErrData: data => {
				app.log.info(data.toString());
			}
		});

		app.fs.copySync(app.path.join(this.rendererDirectory, "build"), app.path.join(this.buildFilesDirectory, "public"));
	}

	copyAssets() {
		app.fs.copySync(app.path.join(this.mainDirectory, "assets"), app.path.join(this.buildDirectory, "win-unpacked", "assets"));
	}

	createPackageFile() {
		const packageFile = app.libs._.omit(info, "build", "dependencies", "devDependencies");

		packageFile.main = "app.bundle.js";

		app.tools.json.save(app.path.join(this.buildFilesDirectory, "package.json"), packageFile);
	}

	async buildElectron() {
		const buildResult = await builder.build();
		app.log.info(buildResult.join(app.os.EOL));
	}
}

ndapp({
	app: new App()
});
