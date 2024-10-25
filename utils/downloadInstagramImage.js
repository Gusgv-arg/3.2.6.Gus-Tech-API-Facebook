import axios from "axios";
import fs from "fs";
import path from "path";

export const downloadInstagramImage = async (url, senderId) => {
	try {
		const response = await axios.get(url, { responseType: "arraybuffer" });
		const buffer = Buffer.from(response.data, "binary");
		const fileName = `${senderId}_${Date.now()}.jpg`;
		const filePath = path.join("/public/temp", fileName);

		await fs.promises.writeFile(filePath, buffer);
		return filePath;
	} catch (error) {
		console.error("Error downloading image:", error);
		throw error;
	}
};
