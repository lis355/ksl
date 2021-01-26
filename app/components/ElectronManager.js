const { app: electronApp, BrowserWindow, screen } = require("electron");
// const { ipcMain: ipc } = require("electron-better-ipc");

// class Page {
// 	constructor() {
// 		this.instance = null;
// 	}

// 	get window() {
// 		return app.electronManager.window;
// 	}

// 	load() { }

// 	unload() {
// 		this.handleUnloaded();
// 	}

// 	handleLoaded() { }
// 	handleUnloaded() { }
// }

// class LauncherPage extends Page {
// 	load() {
// 		super.load();

// 		if (app.constants.DEVELOPER_ENVIRONMENT) {
// 			this.window.loadURL("http://localhost:8000/");
// 		} else {
// 			this.window.loadFile("public/index.html");
// 		}
// 	}

// 	handleLoaded() {
// 		app.events.emit(app.events.EVENT_TYPES.LAUNCHER_UI_CONNECTED);
// 	}

// 	handleUnloaded() {
// 		app.events.emit(app.events.EVENT_TYPES.LAUNCHER_UI_DISCONNECTED);
// 	}
// }

// class BotPage extends Page {
// 	load() {
// 		super.load();

// 		if (app.constants.DEVELOPER_ENVIRONMENT) {
// 			this.window.loadURL("http://localhost:8029/");
// 			// this.window.loadURL("https://jdam.site/jbot/ui/");
// 		} else {
// 			this.window.loadFile(app.bundleManager.botUIIndexPath);
// 		}
// 	}

// 	handleLoaded() {
// 		app.events.emit(app.events.EVENT_TYPES.BOT_UI_CONNECTED);
// 	}

// 	handleUnloaded() {
// 		app.events.emit(app.events.EVENT_TYPES.BOT_UI_DISCONNECTED);
// 	}
// }

// class MessageClient extends app.common.tools.MessageClient {
// 	constructor() {
// 		super();

// 		ipc.answerRenderer(app.electronManager.window, "data", this.handleData.bind(this));
// 	}

// 	// handleConnected() { }

// 	// handleDisconnected() { }

// 	isConnected() {
// 		return true;
// 	}

// 	sendData(data) {
// 		ipc.callRenderer(app.electronManager.window, "data", data);
// 	}

// 	async handleMessage(name, data) {
// 		switch (name) {
// 			case "loaded":
// 				app.electronManager.page.handleLoaded();
// 				break;

// 			default:
// 				// перенаправляем в бота
// 				app.botManager.sendMessage(name, data);
// 				break;
// 		}
// 	}

// 	async handleCommand(command, ...args) {
// 		switch (command) {
// 			case "loaded":
// 				app.electronManager.page.handleLoaded();
// 				break;

// 			case "quit":
// 				return app.quit();

// 			case "reloadWithUpdate":
// 				app.botManager.stopBot();
// 				break;

// 			case "leaveSubscription":
// 				app.subscriptionManager.currentSubscription = null;
// 				app.botManager.stopBot();
// 				break;

// 			default:
// 				if (app.commandsManager.hasCommandProcessor(command)) return app.commandsManager.commandProcessor(command, ...args);

// 				// перенаправляем в бота
// 				const { error, result } = await app.botManager.sendCommand(command, ...args);
// 				if (error) throw error;
// 				return result;
// 		}
// 	}
// };

module.exports = class ElectronManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		// this.setElectronUserDataPath();

		electronApp.whenReady().then(this.handleElectronReady.bind(this));

		// app.events.on(app.events.EVENT_TYPES.BOT_CONNECTED, this.handleBotConnected.bind(this));
		// app.events.on(app.events.EVENT_TYPES.BOT_PROCESS_EXITED, this.handleBotProcessExited.bind(this));
	}

	// setElectronUserDataPath() {
	// 	electronApp.setPath("userData", app.userDataManager.userDataPath("browser"));
	// }

	handleElectronReady() {
		this.createWindow();

		if (app.constants.DEVELOPER_ENVIRONMENT) {
			this.window.loadURL("http://localhost:8000/");
		} else {
			this.window.loadFile("public/index.html");
		}

		// this.page = null;

		// this.currentPage = new LauncherPage();

		// this.messageClient = new MessageClient();
	}

	// handleBotConnected() {
	// 	this.currentPage = new BotPage();
	// }

	// handleBotProcessExited(exitCode, signalCode) {
	// 	if (this.willBeClosed) return;

	// 	this.currentPage = new LauncherPage();
	// }

	// sendMessage(name, data) {
	// 	if (this.messageClient.isConnected()) {
	// 		this.messageClient.sendMessage(name, data);
	// 	}
	// }

	// async sendCommand(name, ...args) {
	// 	if (this.messageClient.isConnected()) {
	// 		this.messageClient.sendCommand(name, ...args);
	// 	}
	// }

	// get currentPage() {
	// 	return this.page;
	// }

	// set currentPage(value) {
	// 	if (this.page === value) return;

	// 	if (this.page) {
	// 		this.page.unload();
	// 	}

	// 	this.page = value;

	// 	if (this.page) {
	// 		this.page.load();
	// 	}
	// }

	createWindow() {
		const { width, height } = screen.getPrimaryDisplay().workAreaSize;

		this.window = new BrowserWindow({
			width: width * 0.8,
			height: height * 0.8,
			webPreferences: {
				nodeIntegration: true,
				enableRemoteModule: true,
				worldSafeExecuteJavaScript: true
				// contextIsolation: true,
				// devTools: app.constants.DEVELOPER_ENVIRONMENT
			},
			frame: false,
			transparent: true,
			show: false
		});

		// this.window.webContents.openDevTools();

		// this.window.maximize();
		this.window.removeMenu();

		this.window.webContents.on("did-finish-load", () => {
			// app.log.info(`Page ${this.window.getURL()} loaded`);

			this.window.show();

			this.window.setIgnoreMouseEvents(true);
		});

		electronApp.on("window-all-closed", () => {
			if (process.platform !== "darwin") {
				this.handleClose();
			}
		});

		this.window.on("close", () => {
			this.handleClose();
		});
	}

	handleClose() {
		this.willBeClosed = true;

		app.quit();
	}

	async exit() {
		await super.exit();

		if (this.window) {
			this.page.unload();
		}

		this.window = null;

		electronApp.quit();
	}
};
