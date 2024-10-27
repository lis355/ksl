import fs from "fs-extra";

export default function clearDirSync(dir) {
	fs.removeSync(dir);
	fs.ensureDirSync(dir);
};
