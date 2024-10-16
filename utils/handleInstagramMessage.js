import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_TOKEN;
const INSTAGRAM_TESTUSERGGV = process.env.INSTAGRAM_TOKEN_GGV
let accessToken

// Function that sends message to Messenger user
export const handleInstagramMessage = async (senderId, messageGpt) => {
	
	if (senderId === '1349568352682541'){
		// Token from testuserggv generated in Configuracion de la API con Inicio de sesion con Instagram
		//accessToken= INSTAGRAM_TESTUSERGGV
		accessToken = INSTAGRAM_ACCESS_TOKEN  
	} else {
		accessToken = INSTAGRAM_ACCESS_TOKEN  
	}
console.log("access token:", accessToken)
	try {
		const name = "MegaBot";
		const channel = "facebook";
		console.log("senderId recibido en handleInstagramMessage:", senderId)

		// Posts the message to Instagram
		const url = `https://graph.facebook.com/v20.0/${FACEBOOK_PAGE_ID}/messages?access_token=${accessToken}`;
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
					"Error enviando a Instagram desde handleInstagramMessage.js:",
					error.response ? error.response.data : error.message
				);
			});
	} catch (error) {
		console.log("Error en handleInstagramMessage.js", error.message);
		throw error;
	}
};
