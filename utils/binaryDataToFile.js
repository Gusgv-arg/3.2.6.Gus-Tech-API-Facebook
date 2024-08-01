import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { fileTypeFromBuffer } from 'file-type';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

const ffmpegAsync = promisify(ffmpeg);

export const binaryDataToFile = async (binaryData) => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "audio-"));
    
    // Detect file type
    const type = await fileTypeFromBuffer(Buffer.from(binaryData));
    
    if (!type || !type.ext) {
        throw new Error('Unable to determine file type');
    }

    const originalFilename = `original.${type.ext}`;
    const originalFilePath = path.join(tempDir, originalFilename);

    await fs.writeFile(originalFilePath, Buffer.from(binaryData));

    // Convert to ogg
    const convertedFilename = 'converted.ogg';
    const convertedFilePath = path.join(tempDir, convertedFilename);

    await new Promise((resolve, reject) => {
        ffmpeg(originalFilePath)
            .toFormat('ogg')
            .on('error', (err) => reject(err))
            .on('end', () => resolve())
            .save(convertedFilePath);
    });

    // Clean up the original file
    await fs.unlink(originalFilePath);

    return { filePath: convertedFilePath, mimeType: 'audio/ogg' };
};
