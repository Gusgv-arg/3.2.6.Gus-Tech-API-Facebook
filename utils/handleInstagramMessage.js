import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

// Function that sends message to Messenger user
export const handleInstagramMessage = async (senderId, messageGpt) => {
	try {
		const name = "MegaBot";
		const channel = "facebook";

		// Posts the message to Instagram
		const url = `https://graph.facebook.com/v20.0/${FACEBOOK_PAGE_ID}/messages?access_token=${PAGE_ACCESS_TOKEN}`;
		const data = {
			recipient: {
				id: senderId,
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
				console.log("Response from Instagram:", response.data);
			})
			.catch((error) => {
				console.error(
					"Error enviando a Instagram:",
					error.response ? error.response.data : error.message
				);
			});
	} catch (error) {
		console.log("Error en handleInstagramMessage.js", error.message);
		throw error;
	}
};
