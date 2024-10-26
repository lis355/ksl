const { app: electronApp, Tray, Menu, BrowserWindow, screen, shell } = require("electron");
const { ipcMain: ipc } = require("electron-better-ipc");

const { MESSAGE_TYPES } = app.enums;

module.exports = class ElectronManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		// electronApp.commandLine.appendSwitch("wm-window-animations-disabled");

		electronApp.whenReady().then(this.handleElectronReady.bind(this));
	}

	sendMessage(message, data = {}) {
		ipc.callRenderer(this.window, "message", { message, data });
	}

	handleMessage(data) {
		switch (data.message) {
			case MESSAGE_TYPES.UPDATE_SIZE: this.updateActualWindowSize(data.data); break;
			case MESSAGE_TYPES.HIDE: this.window.hide(); break;
			case MESSAGE_TYPES.INPUT: break;
			default: break;
		}
	}

	handleElectronReady() {
		electronApp.on("window-all-closed", () => {
			if (process.platform !== "darwin") {
				electronApp.quit();
			}
		});

		electronApp.on("will-quit", () => {
			app.events.emit(app.events.EVENT_TYPES.ELECTRON_APP_WILL_CLOSE);
		});

		this.createTray();
		this.createWindow();

		ipc.answerRenderer(app.electronManager.window, "message", this.handleMessage.bind(this));

		if (app.constants.DEVELOPER_ENVIRONMENT) {
			// this.window.loadURL("http://localhost:8000/");
			this.window.loadFile(app.path.join(app.constants.CWD, "../ui/build/index.html"));
		} else {
			this.window.loadFile("public/index.html");
		}

		app.events.emit(app.events.EVENT_TYPES.ELECTRON_APP_READY);
	}

	createTray() {
		this.tray = new Tray(app.assetsManager.assetPath("icon.ico"));

		const contextMenu = Menu.buildFromTemplate([
			{
				label: `${app.info.name} v${app.info.version}`,
				enabled: false
			},
			{
				label: "Options",
				click: () => {
					shell.openPath(app.optionsManager.optionsFilePath);
				}
			},
			{
				type: "separator"
			},
			{
				label: "Quit",
				click: () => {
					electronApp.quit();
				}
			}
		]);

		this.tray.setContextMenu(contextMenu);
		this.tray.setToolTip(`${app.info.name} v${app.info.version}`);

		this.tray.on("click", () => {
			this.showWindowIfNotVisible();
		});
	}

	createWindow() {
		const browserWindowOptions = {
			backgroundColor: "#00000000",
			frame: false,
			center: true,
			maximizable: false,
			minimizable: false,
			width: 500,
			resizable: false,
			webPreferences: {
				nodeIntegration: true,
				webSecurity: false,
				enableRemoteModule: true,
				devTools: false
			},
			transparent: true,
			alwaysOnTop: true,
			show: false,
			skipTaskbar: true
		};

		if (app.constants.DEVELOPER_ENVIRONMENT) {
			browserWindowOptions.webPreferences.devTools = true;
			browserWindowOptions.frame = true;
			browserWindowOptions.width = 1024;
			browserWindowOptions.alwaysOnTop = false;
		}

		this.window = new BrowserWindow(browserWindowOptions);

		this.window.setBounds({ y: Math.floor(screen.getPrimaryDisplay().workAreaSize.height * 0.25) });

		if (app.constants.DEVELOPER_ENVIRONMENT) {
			this.window.webContents.openDevTools();
			// this.window.removeMenu();
		}

		this.window.webContents.on("did-finish-load", () => {
			if (app.constants.DEVELOPER_ENVIRONMENT) {
				this.window.show();
			}
		});

		this.window.on("blur", () => {
			this.window.hide();
		});

		// DEBUG
		setInterval(() => {
			this.sendMessage("handled", Date());
		}, 1000);
	}

	updateActualWindowSize(clientSize) {
		this.window.setBounds({ height: clientSize.height });
	}

	showWindowIfNotVisible() {
		if (!this.window.isVisible()) {
			this.window.show();
		}
	}
};
