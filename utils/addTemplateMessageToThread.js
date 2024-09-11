import OpenAI from "openai";
import dotenv from "dotenv";
import { adminWhatsAppNotification } from "./adminWhatsAppNotification.js";

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: API_KEY,
});

export const addTemplateMessageToThread = async (
	campaignThread,
	personalizedMessage
) => {
	try {
		// Add Template message to the Thread
		await openai.beta.threads.messages.create(
			campaignThread,
			{
				role: "user",
				content: "Hola",
			},
			{ role: "assistant", content: personalizedMessage }
		);

	} catch (error) {
		console.log("Error en addTemplateMessageToThread.js:", error.message);
		await adminWhatsAppNotification(
			`*Notificanción de Error de Campaña:*\n${error.message}`
		);
	}
};
