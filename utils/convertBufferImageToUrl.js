import { Buffer } from "buffer";
import { fileTypeFromBuffer } from "file-type";

// New function to convert image buffer to data URI
export const convertBufferImageToUrl = async (imageBufferData) => {

    if (!imageBufferData) return null;

    try {
		const fileType = await fileTypeFromBuffer(imageBufferData);
		if (!fileType) {
			throw new Error("Unsupported file type");
		}

		const base64Image = Buffer.from(imageBufferData).toString("base64");
		return `data:${fileType.mime};base64,${base64Image}`;

	} catch (error) {
		console.log("Error in convertBufferImageToUrl:", error.message);
		throw error;
	}
};
