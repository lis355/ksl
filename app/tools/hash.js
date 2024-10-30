import crypto from "node:crypto";

export default function hash(string) {
	return crypto.createHash("md5").update(string).digest("hex");
}
