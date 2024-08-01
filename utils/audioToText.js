import OpenAI from "openai";
import dotenv from "dotenv";
import { Readable } from 'stream';
dotenv.config();

const API_KEY = process.env.API_KEY_CHATGPT;

const openai = new OpenAI({
    apiKey: API_KEY,
	organization: "org-6qNfHtCMODNqGNtPAbbhLhfA",
	project: "proj_cLySVdd60XL8zbjd9zc8gGMH",
});

async function audioToText() {{ buffer, originalFilename }
	try {
		const stream = Readable.from(buffer);
        stream.path = originalFilename;

        const transcription = await openai.audio.transcriptions.create({
            file: stream,
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
