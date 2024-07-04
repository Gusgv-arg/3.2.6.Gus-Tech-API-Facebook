import dotenv from "dotenv"
import axios from "axios"

dotenv.config()

const whatsappToken = process.env.WHATSAPP_TOKEN;


export const handleWhatsappMessage = async ()=>{


    try {
        const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
			const data = {
				messaging_product: "whatsapp",
				recipient_type: "individual",
				to: `+${userPhone}`,
				type: "text",
				text: {
					preview_url: true,
					body: "Hola desde https://www.gus-tech.com",
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
        
    }

}