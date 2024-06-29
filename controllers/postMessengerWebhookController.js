import { handleMessage } from "../utils/handleMessage.js";
import { MessageQueue } from "../utils/messageQueue.js";
import { processMessageWithAssistant } from "../utils/processMessageWithAssistant.js";


// Define a new instance of MessageQueue
const messageQueue = new MessageQueue();

// Webhook that receives message from Facebook messenger
export const postMessengerWebhookController = (req, res) => {
	const body = req.body;
	console.log("Lo que recibo de la API de facebook", body);
	console.log("Mensaje del usuario ---->", body.entry[0].messaging[0].message.text);
	
	// Check if its Messenger App
	if (body.object === "page") {
				
		// Facebook sends an array that can have more than 1 
		body.entry.forEach(async (entry) => {
			
			// Gets body of the webhook event
			let webhook_event = entry.messaging[0];
			console.log("entry.messaging[0].sender:", entry.messaging[0].sender)
			
			// Get the sender PSID
			let sender_psid = webhook_event.sender.id;
			console.log("sender_psid", sender_psid)
			
			if (webhook_event.message) {
				// Get the message sent by the user
				const userMessage = webhook_event.message.text;
				
				// Add message to the Queue
				/* Steps:
				   1- Enqueues the message to the Queue
				   2- Calls processQueue to process the message
				   3- processQueue takes the first message
				   4- Calls processMessageWithAssistant to get the response for the user
				   5- processMessagewithAssistant calls saveMessageInDb and saves the user question in DB  
				   6- Calls handleMessage that calls saveMessageInDb to save GPT response in DB
				   7- Then posts the message to the user in Facebook
				*/
                messageQueue.enqueueMessage(userMessage, sender_psid)                
			}
		});

		// Returns a '200 OK' response to all requests
		res.status(200).send("EVENT_RECEIVED");
	} else {
		// Return a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}
};
