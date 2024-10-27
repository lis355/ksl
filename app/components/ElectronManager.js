import { app as electronApp, Tray, Menu, BrowserWindow, screen, shell, ipcMain } from "electron";

export default class ElectronManager extends ndapp.ApplicationComponent {
	async initialize() {
		await super.initialize();

		electronApp.commandLine.appendSwitch("wm-window-animations-disabled");

		electronApp.whenReady().then(this.handleElectronReady.bind(this));
	}

	sendMessage(message) {
		if (app.isDevelopment) app.log.info("MAIN ElectronManager.sendMessage", message);

		this.window.webContents.send("message", message);
	}

	handleMessage(event, message) {
		if (app.isDevelopment) app.log.info("MAIN ElectronManager.handleMessage", message);

		switch (message.message) {
			case app.enums.MESSAGE_TYPES.UPDATE_SIZE: this.updateActualWindowSize(message); break;
			case app.enums.MESSAGE_TYPES.HIDE: this.window.hide(); break;
			case app.enums.MESSAGE_TYPES.INPUT: app.keystrokeLauncherManager.input(message.value); break;
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

		ipcMain.on("message", this.handleMessage.bind(this));

		if (app.isDevelopment) {
			this.window.loadURL("http://localhost:8000/");
			// this.window.loadFile(app.path.join(app.constants.CWD, "../ui/build/index.html"));
		} else {
			this.window.loadFile("public/index.html");
		}

		app.events.emit(app.events.EVENT_TYPES.ELECTRON_APP_READY);
	}

	createTray() {
		this.tray = new Tray(app.assetsManager.assetPath("icon.ico"));

		const contextMenu = Menu.buildFromTemplate([
			{
				label: `${app.name} v${app.version}`,
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
		this.tray.setToolTip(`${app.name} v${app.version}`);

		this.tray.on("click", () => {
			console.log(this.window.isVisible(), this.window.isFocused());
			// if (this.window.isVisible()) this.window.hide();
			// else this.window.show();
		});
	}

	createWindow() {
		const browserWindowOptions = {
			backgroundColor: "#00000000",
			frame: false,
			center: true,
			maximizable: false,
			minimizable: false,
			resizable: false,
			// https://github.com/electron/electron-quick-start/issues/463
			// threhe are many problems with using electron in ui, now you cannot ust import it in beginning of file
			// you must use these webPreferences options
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
				enableRemoteModule: true,
				devTools: false
			},
			transparent: true,
			alwaysOnTop: true,
			show: false,
			skipTaskbar: true
		};

		if (app.isDevelopment) {
			browserWindowOptions.webPreferences.devTools = true;
			browserWindowOptions.frame = true;
			browserWindowOptions.width = 1024;
			browserWindowOptions.alwaysOnTop = false;
			browserWindowOptions.transparent = false;
		}

		this.window = new BrowserWindow(browserWindowOptions);

		const primaryDisplay = screen.getPrimaryDisplay();

		this.window.setBounds({
			y: Math.floor(primaryDisplay.workAreaSize.height * 0.25),
			width: Math.floor(primaryDisplay.workAreaSize.width * 0.5)
		}, false);

		if (app.isDevelopment) {
			this.window.webContents.openDevTools();
			// this.window.removeMenu();
		}

		this.window.webContents.on("did-finish-load", () => {
			if (app.isDevelopment) this.window.show();
		});

		this.window.on("blur", () => {
			this.window.hide();
		});
	}

	updateActualWindowSize({ width, height }) {
		app.log.info(`updateActualWindowSize ${width}x${height}`);

		if (app.isDevelopment) return;

		this.window.setBounds({ width, height }, false);
	}

	showWindowIfNotVisible() {
		if (!this.window.isVisible()) {
			this.window.show();
		}
	}
};
