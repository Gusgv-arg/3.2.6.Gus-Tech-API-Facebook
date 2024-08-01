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

    const convertedFilename = 'converted.ogg';
    const convertedFilePath = path.join(tempDir, convertedFilename);

    try {
        await convertAudio(originalFilePath, convertedFilePath);
    } catch (error) {
        console.error('Error during initial conversion:', error.message);
        console.log('Attempting to extract audio without re-encoding...');
        
        try {
            await extractAudio(originalFilePath, convertedFilePath);
        } catch (extractError) {
            console.error('Error during audio extraction:', extractError.message);
            throw new Error('Failed to process audio file');
        }
    }

    const convertedStats = await fs.stat(convertedFilePath);
    console.log(`Converted file size: ${convertedStats.size} bytes`);

    // Clean up the original file
    await fs.unlink(originalFilePath);

    return { filePath: convertedFilePath, mimeType: 'audio/ogg' };
};

async function convertAudio(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('wav')
            .on('error', (err) => reject(err))
            .on('end', () => {
                ffmpeg(outputPath.replace('.ogg', '.wav'))
                    .toFormat('ogg')
                    .on('error', (err) => reject(err))
                    .on('end', () => {
                        fs.unlink(outputPath.replace('.ogg', '.wav'))
                            .then(() => resolve())
                            .catch(reject);
                    })
                    .save(outputPath);
            })
            .save(outputPath.replace('.ogg', '.wav'));
    });
}

async function extractAudio(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .noVideo()
            .audioCodec('libvorbis')
            .toFormat('ogg')
            .on('error', (err) => reject(err))
            .on('end', () => resolve())
            .save(outputPath);
    });
}