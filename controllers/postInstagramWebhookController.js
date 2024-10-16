import { MessageQueueInstagram } from "../utils/messageQueueInstagram.js";

// Define a new instance of MessageQueue
const messageQueue = new MessageQueueInstagram();

// Webhook that receives message from Instagram Messenger
export const postInstagramWebhookController = (req, res) => {
	const body = req.body;
	console.log("Lo que recibo de la API de Instagram", body);
	console.log(
		"Mensaje del usuario ---->",
		body?.entry[0]?.messaging[0]?.message?.text
			? body.entry[0].messaging[0].message.text
			: "no se"
	);
	console.log(
		"Messaging ---->",
		body?.entry[0]?.messaging[0]
			? body.entry[0].messaging[0]
			: "no se"
	);
        
	// Check if its Instagram App
	if (body.object === "instagram") {
		// Facebook sends an array that can have more than 1
		body.entry.forEach(async (entry) => {
			// Gets body of the webhook event
			let webhook_event = entry.messaging[0];
	
			// Get the sender ID
			let senderId = webhook_event.sender.id;
			
			if (webhook_event.message) {
				const channel = "instagram";
				const name = "Instagram user";
				// Get the message sent by the user & create an object to send it to the queue
				const userMessage = {
					channel: channel,
					message: webhook_event.message.text ? webhook_event.message.text : "",
					name: name,
					type: req.type ? req.type : "text",
					url: body?.entry[0]?.messaging?.[0]?.message?.attachments?.[0]
						?.payload.url
						? body.entry[0].messaging[0].message.attachments[0].payload.url
						: "",
				};
				
				// Add message to the Instagram Queue
				messageQueue.enqueueInstagramMessage(userMessage, senderId);
			}
		});

		// Returns a '200 OK' response to all requests
		res.status(200).send("EVENT_RECEIVED");
	} else {
		// Return a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}
};