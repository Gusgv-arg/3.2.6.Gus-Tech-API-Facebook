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

	// Check if the file is empty
    const stats = await fs.stat(originalFilePath);
    if (stats.size === 0) {
        throw new Error('The audio file is empty');
    }

    console.log(`Original file type: ${type.ext}, size: ${stats.size} bytes`);

	// Convert to ogg
    const convertedFilename = 'converted.ogg';
    const convertedFilePath = path.join(tempDir, convertedFilename);

    try {
        await new Promise((resolve, reject) => {
            ffmpeg(originalFilePath)
                .toFormat('ogg')
                .on('error', (err) => reject(err))
                .on('progress', (progress) => {
                    console.log(`Processing: ${progress.percent}% done`);
                })
                .on('end', () => resolve())
                .save(convertedFilePath);
        });
    } catch (error) {
        console.error('Error during conversion:', error.message);
        throw error;
    }

    // Check if the converted file exists and is not empty
    const convertedStats = await fs.stat(convertedFilePath);
    if (convertedStats.size === 0) {
        throw new Error('The converted audio file is empty');
    }

    console.log(`Converted file size: ${convertedStats.size} bytes`);

    // Clean up the original file
    await fs.unlink(originalFilePath);

    return { filePath: convertedFilePath, mimeType: 'audio/ogg' };

};
