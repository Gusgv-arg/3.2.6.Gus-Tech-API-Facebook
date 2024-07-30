import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

export const getAudioWhatsappUrl = async (audioId) => {
	const url = `https://graph.facebook.com/v20.0/${audioId}?phone_number_id=${myPhoneNumberId}`;
	try {
		const audioUrl = await axios.get(url, {
			headers: {
				'Authorization': `Bearer ${whatsappToken}`
			}
		});
		console.log("Audio URL en getAudioWhatsappUrl", audioUrl);
		return audioUrl;
	} catch (error) {
		console.log("Error en getAudioWhatsappUrl", error.message);
	}
};
