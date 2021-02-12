const { app: electronApp, Tray, Menu, BrowserWindow, screen } = require("electron");
const { ipcMain: ipc } = require("electron-better-ipc");

const { MESSAGE_TYPES } = app.enums;

module.exports = class ElectronManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		electronApp.whenReady().then(this.handleElectronReady.bind(this));
	}

	handleElectronReady() {
		this.createTray();
		this.createWindow();

		ipc.answerRenderer(app.electronManager.window, "data", this.handleMessage.bind(this));

		if (app.constants.DEVELOPER_ENVIRONMENT) {
			this.window.loadURL("http://localhost:8000/");
		} else {
			this.window.loadFile("public/index.html");
		}
	}

	createTray() {
		this.tray = new Tray(app.path.join(app.constants.CWD, "assets", "icon.ico"));

		const contextMenu = Menu.buildFromTemplate([
			{ label: "Item1", type: "radio" },
			{ label: "Item2", type: "radio" },
			{ label: "Item3", type: "radio", checked: true },
			{ label: "Item4", type: "radio" }
		]);

		this.tray.setContextMenu(contextMenu);

		this.tray.on("click", () => {
			this.window.show();
		});
	}

	createWindow() {
		this.window = new BrowserWindow({
			backgroundColor: "#00000000",
			center: true,
			frame: false,
			maximizable: false,
			minimizable: false,
			width: 500,
			resizable: false,
			webPreferences: {
				nodeIntegration: true,
				enableRemoteModule: true,
				devTools: app.constants.DEVELOPER_ENVIRONMENT
			},
			transparent: true,
			alwaysOnTop: true,
			show: false,
			skipTaskbar: false
		});

		this.window.setBounds({ y: Math.floor(screen.getPrimaryDisplay().workAreaSize.height * 0.25) });

		// this.window.webContents.openDevTools();
		// this.window.removeMenu();

		this.window.webContents.on("did-finish-load", () => {
			// this.window.show();
		});

		this.window.on("blur", () => {
			this.window.hide();
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
		switch (data.message) {
			case MESSAGE_TYPES.UPDATE_SIZE: this.updateActualWindowSize(data.data); break;
			case MESSAGE_TYPES.HIDE: this.window.hide(); break;
			case MESSAGE_TYPES.INPUT: break;
			default: break;
		}
	}

	updateActualWindowSize(clientSize) {
		this.window.setBounds({ height: clientSize.height });
	}
};
