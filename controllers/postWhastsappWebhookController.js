import axios from "axios";
import { MessageQueue } from "../utils/messageQueue.js";

// Define a new instance of MessageQueue
const messageQueue = new MessageQueue();

export const postWhatsappWebhookController = async (req, res) => {
	const body = req.body;
	const type = req.type;
	console.log("Type:", type);
	let audioId
	if (type === "audio") {
		audioId = body.entry[0].changes[0].value.messages[0].audio
			? body.entry[0].changes[0].value.messages[0].audio.id
			: "otro formato";
		console.log("Audio ID:", audioId);		
	}
	//console.log("Lo que recibo x WhatsApp de la API de facebook -->", body);
	//console.log("Changes-->", body.entry[0].changes[0])
	//console.log("Contacts-->", body.entry[0].changes[0].value.contacts)

	//LO PRIMERO QUE TENGO QUE HACER ES GRABAR EL MENSAJE DEL USUARIO EN LA BD!!!!

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
			const message =
				type === "audio"
					? "Audio message"
					: body.entry[0].changes[0].value.messages[0].text.body;
			const userPhone = body.entry[0].changes[0].value.messages[0].from;
			const channel = "whatsapp";
			const name = body.entry[0].changes[0].value.contacts[0].profile.name;
			//console.log("User message-->", message);
			//console.log("User message phone-->", userPhone);

			// Get the message sent by the user & create an object to send it to the queue
			const userMessage = {
				channel: channel,
				message: message,
				name: name,
				type: type,
				audioId: audioId ? audioId : ""
			};

			messageQueue.enqueueMessage(userMessage, userPhone);

			// Returns a '200 OK' response to all requests
			res.status(200).send("EVENT_RECEIVED");
		}
	} else {
		console.log("Object send by WhatsApp not processed by this API", body);
		res.status(400).send("Not processed by this API");
	}
};
