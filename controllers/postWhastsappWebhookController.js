import axios from "axios";
import { MessageQueue } from "../utils/messageQueue.js";

// Define a new instance of MessageQueue
const messageQueue = new MessageQueue();

export const postWhatsappWebhookController = async (req, res) => {
	const body = req.body;
	console.log("Lo que recibo x WhatsApp de la API de facebook -->", body);
  console.log("Phone number Id", body.entry[0].changes[0].value.metadata.phone_number_id)
  console.log("Changes-->", body.entry[0].changes[0])
  console.log("Messages-->", body.entry[0].changes[0].messages[0])
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
			const message = body.entry[0].changes[0].value.messages[0].text.body;
			const userPhone = body.entry[0].changes[0].value.messages[0].from;
			const channel = "whatsapp";
			console.log("User message-->", message);
			console.log("User message phone-->", userPhone);

			// Get the message sent by the user & create an object to send it to the queue
			const userMessage = {
				channel: channel,
				message: message,
			};

			messageQueue.enqueueMessage(userMessage, userPhone);

			// Returns a '200 OK' response to all requests
			res.status(200).send("EVENT_RECEIVED");
		}
	} else {
		res.status(400).send("Not found");
	}
};
