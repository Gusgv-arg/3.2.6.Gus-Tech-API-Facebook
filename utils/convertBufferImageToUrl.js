import { Buffer } from "buffer";
import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

export const convertBufferImageToUrl = async (imageBufferData) => {
    if (!imageBufferData) return null;

    try {
        const fileType = await fileTypeFromBuffer(imageBufferData);
        if (!fileType) {
            throw new Error("Unsupported file type");
        }

        const fileName = `${uuidv4()}.${fileType.ext}`;
        const publicDir = path.join(process.cwd(), 'public', 'temp');
        await fs.mkdir(publicDir, { recursive: true });
        const filePath = path.join(publicDir, fileName);
        
        await fs.writeFile(filePath, imageBufferData);

        // Asumiendo que tu servidor sirve archivos estáticos desde la carpeta 'public'
        return `/temp/${fileName}`;

    } catch (error) {
        console.log("Error in convertBufferImageToUrl:", error.message);
        throw error;
    }
};