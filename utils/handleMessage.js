import dotenv from "dotenv";
import axios from "axios";
//import { saveMessageInDb } from "./saveMessageInDb.js";

dotenv.config();

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

export const handleMessage = async (sender_psid, mensajeHarcodeado) => {
	try {
		const name = "AI-Megamoto";
		const role = "assistant";
		const channel = "facebook";

		// Save the sent message in the database
		/* await saveMessageInDb(
			name,senderId,
			role,messageGpt,
			messageId,channel,threadId
		); */

		// Posts the message to Facebook
		const url = `"https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}/messages?access_token=${PAGE_ACCESS_TOKEN}"`;
		const data = {
			recipient: {
				id: sender_psid,
			},
			messaging_type: "RESPONSE",
			message: {
				text: mensajeHarcodeado,
			},
		};

		const response = await axios
			.post(url, data, {
				headers: {
					"Content-Type": "application/json",
				},
			})
			.then((response) => {
				console.log("Response:", response.data);
			})
			.catch((error) => {
				console.error("Error:", error);
			});

		/* const response = await axios.post(
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
		}*/
	} catch (error) {
		console.log("Error en handleMessage", error.message);
		res.status(404).send(error.message);
	}
};
