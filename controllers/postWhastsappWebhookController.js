import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const whatsappToken = process.env.WHATSAPP_TOKEN;

export const postWhatsappWebhookController = async (req, res) => {
	const body = req.body;
	console.log("Lo que recibo x WhatsApp de la API de facebook -->", body);
	/* Object from Webhook
     {
        "object": "whatsapp_business_account",
        "entry": [{
          "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
          "changes": [{
            "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                "display_phone_number": PHONE_NUMBER,
                "phone_number_id": PHONE_NUMBER_ID
              },
              "contacts": [{
                "profile": {
                  "name": "NAME"
                },
                "wa_id": PHONE_NUMBER
              }],
              "messages": [{
                "from": PHONE_NUMBER,
                "id": "wamid.ID",
                "timestamp": TIMESTAMP,
                "text": {
                  "body": "MESSAGE_BODY"
                },
                "type": "text"
              }]
            },
            "field": "messages"
          }]
        }]
      }
     */

	if (body.entry[0]) {
		if (
			body.entry &&
			body.entry[0].changes &&
			body.entry[0].changes[0].value.messages &&
			body.entry[0].changes[0].value.messages[0]
		) {
			const userMessage = body.entry[0].changes[0].value.messages[0].text.body;
			const userPhone = body.entry[0].changes[0].value.messages[0].from;
			const myPhoneNumberId =
				body.entry[0].changes[0].value.metadata.phone_number_id; // este es el id de mi cel declarado en la api
			console.log("User message-->", userMessage);
			console.log("User message phone-->", userPhone);
			console.log("Phone number Id-->", myPhoneNumberId);

			const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
			const data = {
				messaging_product: "whatsapp",
				recipient_type: "individual",
				to: +userPhone,
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

			res.status(200).send("Received");
		}
	} else {
		res.status(400).send("Not found");
	}
};
