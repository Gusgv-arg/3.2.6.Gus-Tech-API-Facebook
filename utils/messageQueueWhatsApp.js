import { reSendFlow_1ToCustomer } from "../flows/reSendFlow_1ToCustomer.js";
import { salesFlow_2Notification } from "../flows/salesFlow_2Notification.js";
import { saveVendorFlow_2Response } from "../flows/saveVendorFlow_2Response.js";
import audioToText from "./audioToText.js";
import { convertBufferImageToUrl } from "./convertBufferImageToUrl.js";
import { downloadWhatsAppMedia } from "./downloadWhatsAppMedia.js";
import { errorMessage1 } from "./errorMessages.js";
import { getMediaWhatsappUrl } from "./getMediaWhatsappUrl.js";
import { handleWhatsappMessage } from "./handleWhatsappMessage.js";
import { newErrorWhatsAppNotification } from "./newErrorWhatsAppNotification.js";
import { processWhatsAppWithAssistant } from "./processWhatsAppWithAssistant.js";
import { salesWhatsAppNotification } from "./salesWhatsAppNotification.js";
import { saveMessageInDb } from "./saveMessageInDb.js";

// Class definition for the Queue
export class MessageQueueWhatsApp {
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
					// --- WhatsApp Audio --- //
					if (newMessage.channel === "whatsapp") {
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
						const audioTranscription = await audioToText(
							buffer,
							newMessage.channel
						);

						console.log("Audio transcription:", audioTranscription);

						// Replace message with transcription
						newMessage.message = audioTranscription;
					}

					// ---------- IMAGE -------------------------------------------------//
				} else if (newMessage.type === "image") {
					// --- WhatsApp Image --- //
					if (newMessage.channel === "whatsapp") {
						// Get the Image URL from WhatsApp
						const image = await getMediaWhatsappUrl(newMessage.imageId);
						const imageUrl = image.data.url;
						console.log("Image URL:", imageUrl);

						// Download image from WhatsApp
						const imageBuffer = await downloadWhatsAppMedia(imageUrl);
						const imageBufferData = imageBuffer.data;
						console.log("Image download:", imageBufferData);

						// Convert buffer received from WhatsApp to a public URL
						imageURL = await convertBufferImageToUrl(
							imageBufferData,
							"https://three-2-12-messenger-api.onrender.com"
						);
						console.log("Public image URL:", imageURL);
					}

					// ----------- DOCUMENTS ----------------------------------------------------- //
				} else if (newMessage.type === "document") {
					// --- WhatsApp documents ---//
					if (newMessage.channel === "whatsapp") {
						// Get the Document URL from WhatsApp
						const document = await getMediaWhatsappUrl(newMessage.documentId);
						const documentUrl = document.data.url;
						console.log("Document URL:", documentUrl);

						// Download Document from WhatsApp
						const documentBuffer = await downloadWhatsAppMedia(documentUrl);
						const documentBufferData = documentBuffer.data;
						console.log("Document download:", documentBufferData);

						// Convert buffer received from WhatsApp to a public URL
						documentURL = await convertBufferImageToUrl(
							documentBufferData,
							"https://three-2-12-messenger-api.onrender.com"
						);
						console.log("Public Document URL:", documentURL);
					}
				}

				// Process the message with the Assistant
				const response = await processWhatsAppWithAssistant(
					senderId,
					newMessage.message,
					imageURL,
					newMessage.type,
					newMessage.name
				);

				if (newMessage.channel === "whatsapp") {
					// Send Whatsapp to the user (can be gpt, error message, notification) && save in DB
					// Do not send whatsApp when it´s a flow
					if (
						response.flowFlag !== true ||
						response.notification.includes("¡Gracias por confiar en Megamoto!")
					) {
						await handleWhatsappMessage(
							senderId,
							response?.messageGpt
								? response.messageGpt
								: response.errorMessage
								? response.errorMessage
								: response.notification
						);

						// Save the message in the database
						await saveMessageInDb(
							senderId,
							response?.messageGpt
								? response.messageGpt
								: response.errorMessage
								? response.errorMessage
								: response.notification,
							response?.threadId ? response.threadId : null,
							newMessage,
							response?.campaignFlag,
							response?.flowFlag,
							response?.flowToken
						);
					}

					// If it's a FLOW send notification
					if (response.flowFlag === true) {
						if (response.notification.includes("IMPORTANTE:")) {
							// Enviar whatsApp al cliente avisando que faltan datos (modelo o DNI)
							await handleWhatsappMessage(senderId, response.notification);

							// Grabar en BD
							await saveMessageInDb(
								senderId,
								response.notification,
								response.threadId,
								newMessage,
								response?.campaignFlag,
								response?.flowFlag,
								response?.flowToken
							);

							// Volver a enviar el Flow al cliente
							const flowName = process.env.FLOW_1;
							await reSendFlow_1ToCustomer(senderId, flowName, newMessage.name);
						
						} else if (
							response.notification.includes("Respuesta del Vendedor:") || response.notification.includes("Derivación")
						) {
							console.log(
								"entre en el if de includes Respuesta del Vendedor en messageQueueWhatsApp"
							);
							// Grabar respuesta del vendedor en BD y buscar nombre del cliente
							const customerData = await saveVendorFlow_2Response(
								senderId,
								response.notification,
								response.flowToken,
								newMessage.name
							);

							const { customerName, customerPhone, vendorPhone, vendorName, customerQuestion } =
								customerData;

							let salesNotification;
							let customerNotification;

							// Derivación del vendedor
							if (response.notification.includes("Derivación")) {
								salesNotification = `*NOTIFICACION de Atención de Cliente: ${customerName} - ${customerPhone}*\nDerivaste el cliente a ${vendorName}.`;

								// Notificar al vendedor que deriva
								await salesWhatsAppNotification(senderId, salesNotification);

								// Enviar Flow 2 al vendedor derivado
								// Sacar espacios x restricción de WhatsApp
								const cleanedNotification = customerQuestion
									.replace(/\n/g, " ")
									.replace(/ +/g, " ");

								// Envío de Flow al vendedor al que le derivan
								await salesFlow_2Notification(customerPhone, cleanedNotification, vendorPhone);

							} else if (
								response.notification.includes("Atender") ||
								response.notification.includes("Atender más tarde")
							) {
								// Preparar mensaje según la atención 
								if (response.notification.includes("Atender más tarde")) {
									salesNotification = `*NOTIFICACION de Atención de Cliente: ${customerName} - ${customerPhone}*\nAceptaste atender al cliente más tarde.\n\n ¡No lo dejes esperando por mucho tiempo!`;

									customerNotification = `¡Hola ${customerName} 👋! Te contactamos de Megamoto para informarte que tu vendedor asignado es ${vendorName} con el celular ${vendorPhone}. Te recomendamos agendarlo así lo reconoces cuando te contacte.\nTe pedimos un poco de paciencia 😀.\n\n!Mucha suerte con tu compra! `;
								} else {
									salesNotification = `*NOTIFICACION de Atención de Cliente: ${customerName} - ${customerPhone}*\nAceptaste atender al cliente.\n\n ¡Mucha suerte con tu venta!`;

									customerNotification = `¡Hola ${customerName} 👋! Te contactamos de Megamoto para informarte que tu vendedor asignado es ${vendorName} con el celular ${vendorPhone}. Te recomendamos agendarlo así lo reconoces cuando te contacte. \n\n!Mucha suerte con tu compra! `;
								}

								// Notificar al vendedor
								await salesWhatsAppNotification(senderId, salesNotification);

								// Notificar al cliente sobre el vendedor
								await handleWhatsappMessage(
									customerPhone,
									customerNotification
								);
							}
						} else {
							//----ACA MODIFICAR PARA VER COMO DISTRIBUIR A LOS VENDEDORES PORQUE EL PRIMER CLIENTE SIEMPRE VA AL MISMO CELULAR-----//

							console.log("El customerPhone toma el valor del senderId (último else de messageQueueWhatsApp.js");

							// Sacar espacios x restricción de WhatsApp
							const cleanedNotification = response.notification
								.replace(/\n/g, " ")
								.replace(/ +/g, " ");

							const customerPhone = senderId
							const vendorPhone = process.env.MY_PHONE
							
							// Envío de Flow al vendedor
							await salesFlow_2Notification(customerPhone, cleanedNotification, vendorPhone);
						}
					}
				}
			} catch (error) {
				console.error(`14. Error processing message: ${error.message}`);
				// Send error message to the user
				const errorMessage = errorMessage1;

				// Change flag to allow next message processing
				queue.processing = false;

				// Error handlers
				if (newMessage.channel === "whatsapp") {
					// Send error message to customer
					handleWhatsappMessage(senderId, errorMessage);

					// Send WhatsApp error message to Admin
					newErrorWhatsAppNotification("WhatsApp", error.message);
				}
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
