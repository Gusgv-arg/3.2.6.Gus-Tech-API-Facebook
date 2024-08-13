import dotenv from "dotenv";
import axios from "axios";
import { greeting } from "../utils/greeting.js";
import {errorMessage4} from "../utils/errorMessages.js"

dotenv.config();

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

// Function that sends error message if user exceeds max allowed requests
export const handleWhatsAppMaxResponses = async (name, userPhone) => {
	try {
		// Posts the message to Whatsapp
		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
		const data = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: userPhone,
			type: "text",
			text: {
				preview_url: true,
				body: errorMessage4,
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
		console.log("Error en handleWhatsappMaxResponses", error.message);
		throw error;
	}
};
