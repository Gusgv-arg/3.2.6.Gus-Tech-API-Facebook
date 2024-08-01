import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";
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
		console.log("Audio transcription:", transcription.text)
		return transcription.text;
	} catch (error) {
		console.log("Error en audioToText", error.message)
	}
}

export default audioToText;
