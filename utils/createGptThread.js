import OpenAI from "openai";
import dotenv from "dotenv";
import { greeting, messengerGreeting } from "../utils/greeting.js";

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: API_KEY,
});

export const createGptThread = async (name, message, channel) => {
	try {
		// Create a new  with the initial messages
		const thread = await openai.beta.threads.create({
			messages: [
				{
					role: "user",
					content: message,
				},
				{
					role: "assistant",
					content:
						channel === "WhatsApp"
							? `¡Hola ${name}${greeting}`
							: `${messengerGreeting}`,
				},
			],
		});
		const threadId = thread.id;
		
		return threadId;
	} catch (error) {
		console.log("Error en createGptThread:", error.message);
		throw error;
	}
};
