import OpenAI from "openai";
import dotenv from "dotenv";
import { Blob } from 'buffer';
import { File } from 'formdata-node';
dotenv.config();

const API_KEY = process.env.API_KEY_CHATGPT;

const openai = new OpenAI({
    apiKey: API_KEY,
	organization: "org-6qNfHtCMODNqGNtPAbbhLhfA",
	project: "proj_cLySVdd60XL8zbjd9zc8gGMH",
});

async function audioToText({ buffer, originalFilename }) {
	try {
		const blob = new Blob([buffer], { type: 'audio/ogg' });
        const file = new File([blob], originalFilename, { type: 'audio/ogg' });

        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1",
        });
        console.log("Audio transcription:", transcription.text)
        return transcription.text;
	} catch (error) {
		console.log("Error en audioToText", error.message)
		throw error
	}
}

export default audioToText;
