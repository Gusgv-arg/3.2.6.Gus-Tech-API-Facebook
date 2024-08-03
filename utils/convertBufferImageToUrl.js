import { Buffer } from 'buffer';
import { fileTypeFromBuffer } from 'file-type';

// New function to convert image buffer to data URI
export const convertBufferImageToUrl = async (imageBuffer)=> {
    if (!imageBuffer) return null;

    const fileType = await fileTypeFromBuffer(imageBuffer);
    if (!fileType) {
        throw new Error('Unsupported file type');
    }

    const base64Image = Buffer.from(imageBuffer).toString('base64');
    return `data:${fileType.mime};base64,${base64Image}`;
}
