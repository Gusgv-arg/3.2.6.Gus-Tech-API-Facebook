import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { fileTypeFromBuffer } from 'file-type';

export const binaryDataToFile = async (binaryData) => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "audio-"));
    
    // Detect file type
    const type = await fileTypeFromBuffer(Buffer.from(binaryData));
    
    if (!type || !type.ext) {
        throw new Error('Unable to determine file type');
    }

    const filename = `audio.${type.ext}`;
    const filePath = path.join(tempDir, filename);

    await fs.writeFile(filePath, Buffer.from(binaryData));

    return { filePath, mimeType: type.mime };
};
