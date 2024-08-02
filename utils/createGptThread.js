import OpenAI from "openai";
import dotenv from "dotenv";
import { greeting } from "../utils/greeting.js";

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: API_KEY,
});

export const createGptThread = async (name, message) => {
	try {
		// Create a new thread
		const thread = await openai.beta.threads.create();
		const threadId = thread.id;

		// Pass in the user question && the greeting into the new thread
		await openai.beta.threads.messages.create(
			threadId,
			{
				role: "user",
				content: message,
			},
			{
				role: "assistant",
				content: `¡Hola ${name}${greeting}`,
			}
		);
		return threadId;
	} catch (error) {
		console.log("Error en createGptThread:", error.message);
		throw error;
	}
};
