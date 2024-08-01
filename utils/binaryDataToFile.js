import { promises as fs } from "fs";
import path from "path";
import os from "os";

export const binaryDataToFile = async (binaryData, filename) => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "audio-"));
	const filePath = path.join(tempDir, filename);

	await fs.writeFile(filePath, Buffer.from(binaryData));

	return filePath;
};
