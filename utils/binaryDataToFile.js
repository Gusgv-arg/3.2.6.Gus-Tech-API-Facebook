import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { fileTypeFromBuffer } from 'file-type';
import ffmpeg from 'fluent-ffmpeg';

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

    console.log(`Original file type: ${type.ext}, size: ${binaryData.length} bytes`);

    const convertedFilename = 'converted.mp3';
    const convertedFilePath = path.join(tempDir, convertedFilename);

    try {
        await convertAudio(originalFilePath, convertedFilePath);
        console.log('Audio converted successfully to MP3');
    } catch (convertError) {
        console.error('Error during audio conversion:', convertError.message);
        throw new Error('Failed to process audio file');
    }

    const convertedStats = await fs.stat(convertedFilePath);
    console.log(`Converted file size: ${convertedStats.size} bytes`);

    // Clean up the original file
    await fs.unlink(originalFilePath);

    return { filePath: convertedFilePath, mimeType: 'audio/mpeg' };
};

async function convertAudio(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('mp3')
            .audioCodec('libmp3lame')
            .audioBitrate('128k')
            .on('error', (err) => reject(err))
            .on('end', () => resolve())
            .save(outputPath);
    });
}