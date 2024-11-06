
import { LOG_PATH } from "./constants.js";
import loggerCreator from "./logger.js";

export default function log() {
	return log.logger || (log.logger = loggerCreator({ file: LOG_PATH }));
}
