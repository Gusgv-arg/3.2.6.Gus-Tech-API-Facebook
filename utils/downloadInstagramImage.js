import axios from "axios";
import fs from "fs";
import path from "path";
import config from "../config.js"; 

export const downloadInstagramImage = async (url, senderId) => {
	try {
		const response = await axios.get(url, { responseType: "arraybuffer" });
		const buffer = Buffer.from(response.data, "binary");
		const fileName = `${senderId}_${Date.now()}.jpg`;
		const tempDir = path.join("public", "temp");
		
		// Ensure the directory exists
		await fs.promises.mkdir(tempDir, { recursive: true });
		
		const filePath = path.join(tempDir, fileName);
		const webAccessiblePath = `${config.BASE_URL}/temp/${fileName}`;

		await fs.promises.writeFile(filePath, buffer);
        console.log("Image desde downloadInstagramImage.js:", webAccessiblePath);
		return webAccessiblePath;
	} catch (error) {
		console.error("Error downloading image:", error);
		throw error;
	}
};