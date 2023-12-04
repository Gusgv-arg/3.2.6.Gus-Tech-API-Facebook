import OpenAI from "openai";
import dotenv from "dotenv";
import Messages from "../models/messages.js";
import Webhook_Repeated_Messages from "../models/webhook_repeated_messages.js";
import { validateRequestData } from "../utils/validateRequestData.js";
import { logError } from "../utils/logError.js";
import { errorHandler } from "../utils/errorHandler.js";
import { checkRepeatedWebhookMessage } from "../utils/checkRepeatedWebhookMessage.js";
import { handleMessage } from "../utils/handleMessage.js";
import { processMessageWithAssistant } from "../utils/processMessageWithAssistant.js";
import { exportLeadsToExcel } from "../utils/exportLeadsToExcel.js";

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: API_KEY,
});

//Controller que maneja la repuesta usando el GPT de Megamoto para facebook messenger
export const webhookFacebookController = async (req, res) => {
	try {
		const data = req.body;
		const senderPage = data.message.to;
		const senderId = data.message.from;
		const messageId = data.message.id;
		console.log("Mensaje recibido del webhook--->:", data.message.contents[0].text);
		//console.log("Objeto recibido del webhook--->:", data.message.contents[0]);
		//console.log("Objeto content--->:", data);

		// Check if the data sent by the webhook is complete
		if (!validateRequestData(data)) {
			console.log("Invalid request data")
			return res.status(400).send("Invalid request data");
		}

		
		// Check if the message has already been received
		const existingIdMessage = await checkRepeatedWebhookMessage(data);
		if (existingIdMessage) {
			console.log("Mensaje recibido nuevamente por parte del webhook de Zenvia y grabado en BD")
			return res.status(200).send("Mensaje duplicado registrado");
		}
		
		// Process the message with the assistant
		const response = await processMessageWithAssistant(data, openai);
		
		// Send the message to Zenvia
		await handleMessage(senderPage, senderId, response.messageGpt, response.threadId, messageId);
		
		// Exports Leads to an Excell sheet
		exportLeadsToExcel()
		
		// Responds Zenvia webhook the data has been received correctly
		res.status(200).send("EVENT_RECEIVED");
	
	} catch (error) {
		logError(error, "Hubo un error en el proceso -->");
		res.status(500).send({ error: error.message });
	}
};
