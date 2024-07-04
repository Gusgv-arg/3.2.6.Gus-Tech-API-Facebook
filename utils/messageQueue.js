import { handleMessengerMessage } from "./handleMessengerMessage.js";
import { processMessageWithAssistant } from "./processMessageWithAssistant.js";

// Class definition for the Queue
export class MessageQueue {
	constructor() {
		this.queues = new Map();
	}

	// Function to process the Queue
	async processQueue(sender_psid) {
		const queue = this.queues.get(sender_psid);
		//console.log("Queue:", queue);

		//If there is no queue or there is no processing return
		if (!queue || queue.processing) return;

		// Turn processing to true
		queue.processing = true;

		while (queue.messages.length > 0) {
			// Take the first record and delete it from the queue
			const newMessage = queue.messages.shift();

			try {
				
				// Process the message with the Assistant
				const response = await processMessageWithAssistant(
					sender_psid,
					newMessage.message
				);

				if (newMessage.channel === "messenger") {
					// Send the response back to the user by Messenger
					handleMessengerMessage(
						response.sender_psid,
						response.messageGpt,
						response.threadId
					);
				} else if (newMessage.channel === "whatsapp") {
					// Send the response back to the user by Whatsapp
					console.log("llegue hasta aca!!. Me falta la funcion de handleWhatsappMessage");
					return
				}
			} catch (error) {
				console.error(`14. Error processing message: ${error.message}`);
				// Send error message to the user
				//const errorMessage = await sendErrorMessage(newMessage);

				// Change flag to allow next message processing
				queue.processing = false;

				// If there is an error for a web message, I use callback function to send the error to the user
				if (newMessage.channel === "web" && queue.responseCallback) {
					queue.responseCallback(error, null);
				}

				// Return to webhookController that has res.
				return errorMessage;
			}
		}
		// Change flag to allow next message processing
		queue.processing = false;
	}

	// Function to add messages to the Queue
	enqueueMessage(userMessage, sender_psid, responseCallback = null) {
		// If the queue has no ID it saves it && creates messages, processing and resposeCallbach properties
		if (!this.queues.has(sender_psid)) {
			this.queues.set(sender_psid, {
				messages: [],
				processing: false,
				responseCallback: null,
			});
		}

		// Look for the queue with the sender ID
		const queue = this.queues.get(sender_psid);
		console.log("Queue:", queue)

		// Add the message to the Queue
		queue.messages.push(userMessage);

		// Process the queue
		this.processQueue(sender_psid);
	}
}
