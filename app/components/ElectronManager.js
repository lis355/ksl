import path from "node:path";

import _ from "lodash";
import { app as electronApp, Tray, Menu, BrowserWindow, screen, shell, ipcMain } from "electron";
import Enum from "@lis355/enumjs";

const MESSAGE_TYPES = new Enum([
	"UPDATE_SIZE",
	"HIDE",
	"EXECUTE",
	"INPUT",
	"CLEAR",
	"QUERY_OPTION"
]);

const EVENT_TYPES = new Enum([
	"ELECTRON_APP_READY",
	"ELECTRON_APP_WILL_CLOSE"
]);

import ApplicationComponent from "./ApplicationComponent.js";
import OptionsManager from "./OptionsManager.js";

import {
	APPLICATION_NAME,
	APPLICATION_VERSION,
	CWD,
	ELECTRON_APP_PATH,
	LOG_PATH
} from "../constants.js";

import log from "../log.js";

const DEBUG_FRAME = false;
const DEBUG_DEV_SERVER = true;

export default class ElectronManager extends ApplicationComponent {
	async initialize() {
		await super.initialize();

		electronApp.commandLine.appendSwitch("wm-window-animations-disabled");

		this.application.optionsManager.events.on(OptionsManager.EVENT_TYPES.OPTIONS_CHANGED, this.handleOptionsManagerOnOptionsChanged.bind(this));
	}

	async run() {
		await super.run();

		electronApp.whenReady().then(this.handleElectronReady.bind(this));
	}

	handleElectronReady() {
		this.events.emit(EVENT_TYPES.ELECTRON_APP_READY);

		electronApp.on("window-all-closed", () => {
			if (process.platform !== "darwin") {
				electronApp.quit();
			}
		});

		electronApp.on("will-quit", () => {
			this.events.emit(EVENT_TYPES.ELECTRON_APP_WILL_CLOSE);
		});

		this.createTray();
		this.createWindow();

		ipcMain.on("message", this.handleMessage.bind(this));

		if (this.application.isDevelopment) {
			if (DEBUG_DEV_SERVER) {
				const url = "http://localhost:8000/";
				this.window.loadURL(url);
				log().info(`[ElectronManager]: window loadURL at ${url}`);
			} else {
				const filePath = path.join(CWD, "../ui/build/index.html");
				log().info("[ElectronManager]: window loadFile at ", filePath);
				this.window.loadFile(filePath);
			}
		} else {
			const filePath = path.join(ELECTRON_APP_PATH, "public", "index.html");
			log().info("[ElectronManager]: window loadFile at ", filePath);
			this.window.loadFile(filePath);
		}
	}

	createTray() {
		this.tray = new Tray(this.application.assetsManager.assetPath("icon.ico"));

		const contextMenu = Menu.buildFromTemplate([
			{
				label: `${APPLICATION_NAME} v${APPLICATION_VERSION}`,
				enabled: false
			},
			{
				label: "Options",
				click: () => {
					shell.openPath(this.application.optionsManager.optionsFilePath);
				}
			},
			{
				label: "Log",
				click: () => {
					shell.openPath(LOG_PATH);
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
		this.tray.setToolTip(`${APPLICATION_NAME} v${APPLICATION_VERSION}`);

		this.tray
			.on("click", () => {
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

		if (this.application.isDevelopment &&
			DEBUG_FRAME
		) {
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

		this.window.webContents
			.on("did-finish-load", () => {
				if (this.application.isDevelopment) {
					this.window.webContents.openDevTools();

					this.showWindowIfNotVisible();
				}
			});

		this.window
			.on("blur", () => {
				this.hideWindow();
			});
	}

	handleOptionsManagerOnOptionsChanged() {
		if (this.application.isDevelopment) return;

		if (this.application.optionsManager.options.startOnSystemStart !== electronApp.getLoginItemSettings().openAtLogin) electronApp.setLoginItemSettings({ openAtLogin: this.application.optionsManager.options.startOnSystemStart });

		log().info(`[ElectronManager] launchItems = ${JSON.stringify(electronApp.getLoginItemSettings().launchItems)}`);
	}

	sendMessage(message, data = {}) {
		// if (this.application.isDevelopment) log().info("[ElectronManager]: sendMessage", message, JSON.stringify(data));

		this.window.webContents.send("message", { message, ...data });
	}

	sendQueryOption(queryOption) {
		// if (this.application.isDevelopment) log().info("[ElectronManager]: sendQueryOption", JSON.stringify(queryOption));

		this.sendMessage(MESSAGE_TYPES.QUERY_OPTION, queryOption);
	}

	handleMessage(event, message) {
		// if (this.application.isDevelopment) log().info("[ElectronManager]: handleMessage", JSON.stringify(message));

		const data = _.omit(message, ["message"]);

		switch (message.message) {
			case MESSAGE_TYPES.UPDATE_SIZE: this.updateActualWindowSize(data.width, data.height); break;
			case MESSAGE_TYPES.HIDE: this.hideWindow(); break;
			case MESSAGE_TYPES.EXECUTE: this.application.keystrokeLauncherManager.execute(data); break;
			case MESSAGE_TYPES.INPUT: this.application.keystrokeLauncherManager.input(data.input); break;
			default: break;
		}
	}

	updateActualWindowSize(width, height) {
		// log().info(`updateActualWindowSize ${width}x${height}`);

		if (this.application.isDevelopment &&
			DEBUG_FRAME
		) return;

		this.window.setBounds({ width, height }, false);
	}

	get windowIsVisible() {
		return this.window.isVisible();
	}

	showWindow() {
		this.sendMessage(MESSAGE_TYPES.CLEAR);

		this.window.show();
		this.window.focus();
	}

	showWindowIfNotVisible() {
		if (!this.windowIsVisible) {
			this.showWindow();
		}
	}

	hideWindow() {
		this.window.hide();
	}
};

ElectronManager.EVENT_TYPES = EVENT_TYPES;
