import axios from "axios"
import dotenv from "dotenv";

dotenv.config();

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

export const downloadWhatsAppAudio = async (audioUrl)=>{
    const url = `https://graph.facebook.com/v20.0/${audioUrl}`;
	try {
		const download = await axios.get(url, {
			headers: {
				'Authorization': `Bearer ${whatsappToken}`
			}
		});
		//console.log("Audio URL en getAudioWhatsappUrl", audioUrl);
		return download;
	} catch (error) {
		console.log("Error en downloadWhatsAppAudio", error.message);
	}
};

