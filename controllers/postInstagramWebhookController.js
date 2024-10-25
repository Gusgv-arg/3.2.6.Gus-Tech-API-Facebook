import { MessageQueueInstagram } from "../utils/messageQueueInstagram.js";
import dotenv from "dotenv";

const ownerInstagramAccount = process.env.INSTAGRAM_OWNER_ACCOUNT_ID;

// Define a new instance of MessageQueue
const messageQueue = new MessageQueueInstagram();

// Webhook that receives message from Instagram Messenger
export const postInstagramWebhookController = (req, res) => {
	const body = req.body;
	//console.log("Recibo en postInstagramWebhookController.js: body-->", body);

	if (body.object !== "instagram") {
		return res.sendStatus(404);
	}

	let shouldRespond = true;

	// Check if its Instagram App
	for (const entry of body.entry) {
		// Gets body of the webhook event
		let webhook_event = entry?.messaging?.[0] ?? entry?.standby?.[0] ?? null;
		console.log("webhook_event-->", webhook_event);
		console.log(
			"Attachments -->",
			webhook_event?.message?.attachments?.[0]
				? webhook_event.message.attachments[0]
				: "no attachments"
		);

		// Get the sender ID
		let senderId = webhook_event.sender?.id ?? "";
		//console.log("senderId en postInstagramWebhookController.js:", senderId);

		// Get the recipient ID
		const recipientId = webhook_event.recipient?.id ?? "";

		if (
			senderId === ownerInstagramAccount ||
			recipientId !== ownerInstagramAccount
		) {
			console.log("Skipping message due to sender or recipient mismatch. SenderID:", senderId, "recipientID:", recipientId);
			continue;
		}

		if (webhook_event.message) {
			const channel = "instagram";
			const name = "Instagram user";
			// Get the message sent by the user & create an object to send it to the queue
			const userMessage = {
				channel: channel,
				name: name,
				message: webhook_event.message.text ? webhook_event.message.text : "",
				instagramMid: webhook_event.message.mid ? webhook_event.message.mid : "",
				type: webhook_event?.message?.attachments?.[0].type ? webhook_event.message.attachments[0].type : "text",
				url: webhook_event?.message?.attachments?.[0]?.payload.url
					? webhook_event.message.attachments[0].payload.url
					: "",
			};
			console.log("Object added to queue:", userMessage)

			// Add message to the Instagram Queue
			messageQueue.enqueueInstagramMessage(userMessage, senderId);
		}
	}
	if (shouldRespond) {
		res.status(200).send("EVENT_RECEIVED");
	}
};
