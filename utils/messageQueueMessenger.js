import audioToText from "./audioToText.js";
import { errorMessage1 } from "./errorMessages.js";
import { handleMessengerMessage } from "./handleMessengerMessage.js";
import { newErrorWhatsAppNotification } from "./newErrorWhatsAppNotification.js";
import { processMessengerWithAssistant } from "./processMessengerWithAssistant.js";
import { saveMessageInDb } from "./saveMessageInDb.js";

// Class definition for the Queue
export class MessageQueueMessenger {
	constructor() {
		this.queues = new Map();
	}

	// Function to process the Queue
	async processQueue(senderId) {
		const queue = this.queues.get(senderId);
		//console.log("Queue:", queue);

		//If there is no queue or there is no processing return
		if (!queue || queue.processing) return;

		// Turn processing to true
		queue.processing = true;

		while (queue.messages.length > 0) {
			// Take the first record and delete it from the queue
			let newMessage = queue.messages.shift();
			let imageURL;
			let documentURL;

			try {
				// ---------- AUDIO ---------- //
				if (newMessage.type === "audio") {
					if (newMessage.channel === "messenger") {
						// Call whisper GPT to transcribe audio to text
						const audioTranscription = await audioToText(
							newMessage.url,
							newMessage.channel
						);

						console.log("Audio transcription:", audioTranscription);

						// Replace message with transcription
						newMessage.message = audioTranscription;
					}
					// ---------- IMAGE -------------------------------------------------//
				} else if (newMessage.type === "image") {
					if (newMessage.channel === "messenger") {
						imageURL = newMessage.url;
					}

					// ----------- DOCUMENTS ----------------------------------------------------- //
				} else if (newMessage.type === "document") {
					console.log("Entró un document y no lo proceso");
				}

				// Process the message with the Assistant
				const response = await processMessengerWithAssistant(
					senderId,
					newMessage.message,
					imageURL,
					newMessage.type
				);

				if (newMessage.channel === "messenger") {
					// Send the response back to the user by Messenger
					handleMessengerMessage(
						senderId,
						response?.messageGpt ? response.messageGpt : response.errorMessage
					);

					// Save the message in the database
					await saveMessageInDb(
						senderId,
						response?.messageGpt ? response.messageGpt : response.errorMessage,
						response?.threadId ? response.threadId : null,
						newMessage
					);
				}
			} catch (error) {
				console.error(`14. Error processing message: ${error.message}`);
				// Send error message to the user
				const errorMessage = errorMessage1;

				// Change flag to allow next message processing
				queue.processing = false;

				// Error handlers
				if (newMessage.channel === "messenger") {
					// Send error message to customer
					handleMessengerMessage(senderId, errorMessage);

					// Send WhatsApp error message to Admin
					//newErrorWhatsAppNotification("Messenger", error.message);
				}
			}
		}
		// Change flag to allow next message processing
		queue.processing = false;
	}

	// Function to add messages to the Queue
	enqueueMessengerMessage(userMessage, senderId, responseCallback = null) {
		// If the queue has no ID it saves it && creates messages, processing and resposeCallbach properties
		if (!this.queues.has(senderId)) {
			this.queues.set(senderId, {
				messages: [],
				processing: false,
				responseCallback: null,
			});
		}

		// Look for the queue with the sender ID
		const queue = this.queues.get(senderId);
		//console.log("Queue:", queue);

		// Add the message to the Queue
		queue.messages.push(userMessage);

		// Process the queue
		this.processQueue(senderId);
	}
}
