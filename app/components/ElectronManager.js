const { app: electronApp, BrowserWindow, screen } = require("electron");
const { ipcMain: ipc } = require("electron-better-ipc");

module.exports = class ElectronManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		electronApp.whenReady().then(this.handleElectronReady.bind(this));
	}

	handleElectronReady() {
		this.createWindow();

		ipc.answerRenderer(app.electronManager.window, "data", this.handleMessage.bind(this));

		if (app.constants.DEVELOPER_ENVIRONMENT) {
			this.window.loadURL("http://localhost:8000/");
		} else {
			this.window.loadFile("public/index.html");
		}
	}

	createWindow() {
		const { width, height } = screen.getPrimaryDisplay().workAreaSize;
		const factor = 0.95;

		this.window = new BrowserWindow({
			backgroundColor: "#00000000",
			center: true,
			frame: false,
			maximizable: false,
			minimizable: false,
			width: width * factor,
			height: height * factor,
			webPreferences: {
				nodeIntegration: true,
				enableRemoteModule: true,
				// worldSafeExecuteJavaScript: true
				// contextIsolation: true,
				devTools: app.constants.DEVELOPER_ENVIRONMENT
			},
			transparent: true,
			show: false,
			skipTaskbar: true
		});

		// this.window.webContents.openDevTools();

		this.window.removeMenu();

		this.window.webContents.on("did-finish-load", () => {
			this.window.show();

			this.window.setIgnoreMouseEvents(true);
		});

		electronApp.on("window-all-closed", () => {
			if (process.platform !== "darwin") {
				app.quit();
			}
		});
	}

	sendMessage(message, data = {}) {
		ipc.callRenderer(this.window, "data", { message, data });
	}

	handleMessage(data) {
		console.log("message", data.message, data.data || {});
	}
};
