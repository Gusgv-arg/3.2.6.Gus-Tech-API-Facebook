import dotenv from "dotenv";
import axios from "axios";
import { saveMessageInDb } from "./saveMessageInDb.js";

dotenv.config();

export const handleMessage = async (
	senderPage,
	senderId,
	messageGpt,
	threadId,
	messageId
) => {
	try {
		const name = "AI-Megamoto";
		const role = "assistant";
		const channel = "facebook";

		// Save the sent message in the database
		await saveMessageInDb(
			name,
			senderId,
			role,
			messageGpt,
			messageId,
			channel,
			threadId
		);

		// Posts the message to Zenvia
		const response = await axios.post(
			"https://api.zenvia.com/v2/channels/facebook/messages",
			{
				//from: process.env.ZENVIA_FACEBOOK_PAGE_ID,
				//from: "126769713862973",
				from: senderPage,
				to: senderId,
				contents: [
					{
						type: "text",
						text: messageGpt,
					},
				],
			},
			{
				headers: {
					"X-API-TOKEN": process.env.ZENVIA_API_TOKEN,
				},
			}
		);
		if (response.data) {
			console.log("Message sent successfully to Zenvia", response.data);
		} else {
			console.log("Error sending message to Zenvia");
		}
	} catch (error) {
		console.log("Error en handleMessage", error.message);
		throw new Error(error.message);
	}
};
