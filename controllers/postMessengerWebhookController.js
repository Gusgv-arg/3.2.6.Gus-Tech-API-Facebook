import { handleMessage } from "../utils/handleMessage.js";

// Webhook que recibe el mensaje de facebook messenger
export const postMessengerWebhookController = (req, res) => {
	const body = req.body;
	console.log("Lo que recibo de la API de facebook", body);
	console.log("Messaging---->", body.entry[0].messaging[0].message.text);

	// Check if this is an event from a page subscription
	if (body.object === "page") {
		
		//Verificar que facebook me manda un array con mas de 1 registro
		//Xq no puedo solo agarrar el msje????
		//body.entry.forEach(function (entry) {
		body.entry.forEach(async (entry) => {
			// Gets body of the webhook event
			let webhook_event = entry.messaging[0];
			console.log("webhook event", webhook_event);

			// Get the sender PSID
			let sender_psid = webhook_event.sender.id;
			console.log("sender PSID:", sender_psid);

			if (webhook_event.message) {
				//Handle the message sent by the user
				//const userMessage = webhook_event.messsage.text;

				// Process the message with the assistant
				//const response  = await processMessageWithAssistant(sender_psid, userMessage)

				// Send the response back to the user
				const mensajeHarcodeado = "hola desde AI Bots!!";
				//const response = handleMessage(sender_psid, mensajeHarcodeado);
				handleMessage(sender_psid, mensajeHarcodeado);
			}
		});

		// Returns a '200 OK' response to all requests
		res.status(200).send("EVENT_RECEIVED");
	} else {
		// Return a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}
};
