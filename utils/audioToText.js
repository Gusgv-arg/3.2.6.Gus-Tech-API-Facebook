import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const API_KEY = process.env.API_KEY_CHATGPT;

const openai = new OpenAI({
    apiKey: API_KEY,
	organization: "org-6qNfHtCMODNqGNtPAbbhLhfA",
	project: "proj_cLySVdd60XL8zbjd9zc8gGMH",
});

async function audioToText(file) {
	try {		
		const transcription = await openai.audio.transcriptions.create({
			//file: fs.createReadStream(file.path),
			file: file,
			model: "whisper-1",
		});
		return transcription.text;
	} catch (error) {
		console.log("Error in audioToText:", error.message)
		throw error
	}
}

export default audioToText;
