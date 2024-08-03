import audioToText from "./audioToText.js";
import { convertBufferImageToUrl } from "./convertBufferImageToUrl.js";
import { downloadWhatsAppMedia } from "./downloadWhatsAppMedia.js";
import { getMediaWhatsappUrl } from "./getMediaWhatsappUrl.js";
import { handleMessengerMessage } from "./handleMessengerMessage.js";
import { handleWhatsappMessage } from "./handleWhatsappMessage.js";
import { processMessageWithAssistant } from "./processMessageWithAssistant.js";
import { saveMessageInDb } from "./saveMessageInDb.js";

// Class definition for the Queue
export class MessageQueue {
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
			let imageURL
			
			try {
				// Check if its an audio and transcribe it to text
				if (newMessage.type === "audio") {
					// Get the Audio URL from WhatsApp
					const audio = await getMediaWhatsappUrl(newMessage.audioId);
					const audioUrl = audio.data.url;
					//console.log("Audio URL:", audioUrl);

					// Download audio from WhatsApp
					const audioDownload = await downloadWhatsAppMedia(audioUrl);
					//console.log("Audio download:", audioDownload.data);

					// Create a buffer
					const buffer = Buffer.from(audioDownload.data);

					// Call whisper GPT to transcribe audio to text
					const audioTranscription = await audioToText(buffer);

					console.log("Audio transcription:", audioTranscription);

					// Replace message with transcription
					newMessage.message = audioTranscription;
				
				} else if (newMessage.type === "image") {
					// Get the Image URL from WhatsApp
					const image = await getMediaWhatsappUrl(newMessage.imageId);
					const imageUrl = image.data.url;
					console.log("Image URL:", imageUrl);

					// Download image from WhatsApp
					imageBuffer = await downloadWhatsAppMedia(imageUrl);
					const imageBufferData = imageBuffer.data
					console.log("Image download:", imageBufferData);

					// Convert buffer received from WhatsApp to a public URL
					imageURL = await convertBufferImageToUrl(imageBufferData)
					console.log("image URL:", imageURL)
				}

				// Process the message with the Assistant
				const response = await processMessageWithAssistant(
					senderId,
					newMessage.message,
					imageURL
				);

				if (newMessage.channel === "messenger") {
					// Send the response back to the user by Messenger
					handleMessengerMessage(
						response.senderId,
						response.messageGpt,
						response.threadId
					);

					// Save the message in the database
					await saveMessageInDb(
						senderId,
						response.messageGpt,
						response.threadId,
						newMessage
					);
				} else if (newMessage.channel === "whatsapp") {
					// Send the response back to the user by Whatsapp
					await handleWhatsappMessage(response.senderId, response.messageGpt);

					// Save the message in the database
					await saveMessageInDb(
						senderId,
						response.messageGpt,
						response.threadId,
						newMessage
					);
				}
			} catch (error) {
				console.error(`14. Error processing message: ${error.message}`);
				// Send error message to the user
				const errorMessage =
					"¡Disculpas! Hubo un error en el procesamiento del mensaje. Por favor vuelve a intentar más tarde.";

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
	enqueueMessage(userMessage, senderId, responseCallback = null) {
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
