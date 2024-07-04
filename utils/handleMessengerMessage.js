import dotenv from "dotenv";
import axios from "axios";
import { saveMessageInDb } from "./saveMessageInDb.js";

dotenv.config();

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

// Función que recibe la respuesta del GPT, guarda en BD y envía al usuario la respuesta
export const handleMessengerMessage = async (sender_psid, messageGpt, thread_id) => {
	try {
		const name = "MegaBot";
		//const role = "assistant";
		const channel = "facebook";

		// Save the sent message in the database
		await saveMessageInDb(sender_psid, messageGpt, thread_id, name, channel);

		// Posts the message to Facebook
		const url = `https://graph.facebook.com/v20.0/${FACEBOOK_PAGE_ID}/messages?access_token=${PAGE_ACCESS_TOKEN}`;
		const data = {
			recipient: {
				id: sender_psid,
			},
			messaging_type: "RESPONSE",
			message: {
				text: messageGpt,
			},
		};

		const response = await axios
			.post(url, data, {
				headers: {
					"Content-Type": "application/json",
				},
			})
			.then((response) => {
				console.log("Response from Facebook:", response.data);
			})
			.catch((error) => {
				console.error(
					"Error enviando a Facebook------------>",
					error.response ? error.response.data : error.message
				);
			});
	} catch (error) {
		console.log("Error en handleMessage", error.message);
		res.status(404).send(error.message);
	}
};
