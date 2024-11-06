import path from "node:path";

import { app as electronApp } from "electron";
import fs from "fs-extra";

export const DEVELOPER_ENVIRONMENT = process.env.DEVELOPER_ENVIRONMENT === "true";

const {
	PORTABLE_EXECUTABLE_DIR,
	PORTABLE_EXECUTABLE_FILE,
	LOCALAPPDATA
} = process.env;

export const BUILD_EXE_PATH = PORTABLE_EXECUTABLE_FILE;

export const ELECTRON_APP_PATH = electronApp.getAppPath();

export const CWD = PORTABLE_EXECUTABLE_DIR || ELECTRON_APP_PATH;

const { name, version } = fs.readJsonSync(path.join(ELECTRON_APP_PATH, "./package.json"));

export const APPLICATION_NAME = name;
export const APPLICATION_VERSION = version;

export const LOCAL_APP_DATA_PATH = path.join(LOCALAPPDATA, APPLICATION_NAME);
// export const USER_DATA_PATH = path.join(CWD, "userData");
export const USER_DATA_PATH = path.join(LOCAL_APP_DATA_PATH, "userData");

export const LOG_DIRECTORY = path.join(LOCAL_APP_DATA_PATH, "logs");
export const LOG_PATH = path.join(LOG_DIRECTORY, /*dayjs().format("DD-MM-YYYY HH-mm-ss")*/"log" + ".txt");
