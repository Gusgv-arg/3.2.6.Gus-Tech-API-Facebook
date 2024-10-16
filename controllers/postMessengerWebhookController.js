import { MessageQueueMessenger } from "../utils/messageQueueMessenger.js";

// Define a new instance of MessageQueue
const messageQueue = new MessageQueueMessenger();

// Webhook that receives message from Facebook Messenger
export const postMessengerWebhookController = (req, res) => {
	const body = req.body;
	console.log("Lo que recibo de la API de facebook", body);
	console.log(
		"Mensaje del usuario ---->",
		body.entry[0].messaging[0].message.text
	);

	// Check if its Messenger App
	if (body.object === "page") {
		// Facebook sends an array that can have more than 1
		body.entry.forEach(async (entry) => {
			// Gets body of the webhook event
			let webhook_event = entry.messaging[0];
			console.log("entry.messaging[0].sender:", entry.messaging[0].sender);

			// Get the sender ID
			let senderId = webhook_event.sender.id;
			console.log("sender_psid", senderId);

			if (webhook_event.message) {
				const channel = "messenger";
				const name = "Messenger user"
				// Get the message sent by the user & create an object to send it to the queue
				const userMessage = {
					channel: channel,
					message: webhook_event.message.text ? webhook_event.message.text : "",
					name: name,
					type: req.type ? req.type : "text",
					url: body?.entry[0]?.messaging?.[0]?.message?.attachments?.[0]?.payload.url ? body.entry[0].messaging[0].message.attachments[0].payload.url : "" 
				};

				// Add message to the Messenger Queue
				messageQueue.enqueueMessengerMessage(userMessage, senderId);
			}
		});

		// Returns a '200 OK' response to all requests
		res.status(200).send("EVENT_RECEIVED");
	} else {
		// Return a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}
};
