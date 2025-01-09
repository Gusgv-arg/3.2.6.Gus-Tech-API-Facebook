import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;
const salesPhone = process.env.MY_PHONE

export const salesWhatsAppNotification = async (senderId, notification) => {
	try {
		
		// Posts the message to Whatsapp
		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
		const data = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: senderId ? senderId: salesPhone,
			type: "text",
			text: {
				preview_url: true,
				body: notification,
			},
		};

		const response = await axios
			.post(url, data, {
				headers: {
					"Content-Type": "application/json",
				},
			})
			/* .then((response) => {
				console.log("Response for WhatsApp Notification:", response.data);
			}) */
			.catch((error) => {
				console.error(
					"Error enviando a Facebook------------>",
					error.response ? error.response.data : error.message
				);
			});
            console.log("Notificación de Lead enviada x WhatsApp al vendedor!!")
	} catch (error) {
		console.log("Error in salesWhatsAppNotification.js:", error.message);
		throw error;
	}
};
