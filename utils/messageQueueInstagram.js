import audioToText from "./audioToText.js";
import { errorMessage1 } from "./errorMessages.js";
import { handleInstagramMessage } from "./handleInstagramMessage.js";
import { instagramNewLead } from "./instagramNewLead.js";
import { newErrorWhatsAppNotification } from "./newErrorWhatsAppNotification.js";
import { processInstagramWithAssistant } from "./processInstagramWithAssistant.js";
import { saveMessageInDb } from "./saveMessageInDb.js";

// Class definition for the Queue
export class MessageQueueInstagram {
	constructor() {
		this.queues = new Map();
	}

	// Function to process the Queue
	async processQueue(senderId) {
		const queue = this.queues.get(senderId);
		//console.log("Queue:", queue);
		console.log("this.queues:", this.queues)
		
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
					if (newMessage.channel === "instagram") {
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
					if (newMessage.channel === "instagram") {
						imageURL = newMessage.url;
					}

					// ----------- DOCUMENTS ----------------------------------------------------- //
				} else if (newMessage.type === "document") {
					console.log("Entró un document y no lo proceso");
				}

				// Check if it's a new lead
				await instagramNewLead(newMessage);

				// Process the message with the Assistant
				/* const response = await processInstagramWithAssistant(
					senderId,
					newMessage.message,
					imageURL,
					newMessage.type
				);
				console.log("Response desde processInstagramWithAssistant:", response) */

				/* if (newMessage.channel === "instagram") {
					// Send the response back to the user by Instagram
					await handleInstagramMessage(
						senderId,
						response?.messageGpt ? response.messageGpt : response.errorMessage
					);

					// Save the message in the database
					await saveMessageInDb(
						senderId,
						response?.messageGpt ? response.messageGpt : response.errorMessage,
						response?.threadId ? response.threadId : null,
						newMessage,
						response?.campaignFlag
					);
				} */
			} catch (error) {
				console.error(
					`14. Error processing Instagram message: ${error.message}`
				);
				// Send error message to the user
				const errorMessage = errorMessage1;

				// Change flag to allow next message processing
				queue.processing = false;

				// Error handlers
				if (newMessage.channel === "instagram") {
					// Send error message to customer
					handleInstagramMessage(senderId, errorMessage);

					// Send WhatsApp error message to Admin
					//newErrorWhatsAppNotification("Messenger", error.message);
				}
			}
		}
		// Change flag to allow next message processing
		queue.processing = false;
	}

	// Function to add messages to the Queue
	enqueueInstagramMessage(userMessage, senderId, responseCallback = null) {
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

		// Add the message to the Queue
		queue.messages.push(userMessage);
		//console.log("Queue:", queue);

		// Process the queue
		this.processQueue(senderId);
	}
}
