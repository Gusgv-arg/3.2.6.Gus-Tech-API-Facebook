import Leads from "../models/leads.js";
import { greeting } from "../utils/greeting.js";
import { createGptThread } from "../utils/createGptThread.js";
import { handleWhatsappGreeting } from "../utils/handleWhatsappGreeting.js";

// Middleware that creates the user in DB if it doesn't exist || next()
export const userWhatsAppMiddleware = async (req, res, next) => {
	const body = req.body;
	console.log("Lo que recibo de la API de Whatsapp -->", body);
	let channel = body.entry[0].changes ? "WhatsApp" : "Other";
	console.log("Channel:", channel);
	let status = body?.entry?.[0].changes?.[0].value?.statuses?.[0]
		? "status"
		: null;

	// Return if I receive status update
    if (status !== null) {
		res.status(200).send("EVENT_RECEIVED");
		return;
	}	

	if (channel === "WhatsApp" && body?.entry[0]) {
		let typeOfWhatsappMessage = body.entry[0].changes[0]?.value?.messages[0]
			?.type
			? body.entry[0].changes[0].value.messages[0].type
			: "other type";
		console.log("Type of WhatsApp message:", typeOfWhatsappMessage);

        // Pass type to req object
        req.type = typeOfWhatsappMessage

		const userPhone = body.entry[0].changes[0].value.messages[0].from;
		const name = body.entry[0].changes[0].value.contacts[0].profile.name;
		console.log("User name----->", name);
		console.log("User phone---->", userPhone);

		let message;

		if (typeOfWhatsappMessage === "text") {
			message = body.entry[0].changes[0].value.messages[0].text.body;
			console.log("User message-->", message);
		} else if (typeOfWhatsappMessage === "audio") {
			message = "Audio message";
			console.log("User message-->", message);
		} else {
			message = "Message with another format than audio or text";
			console.log("User message-->", message);
		}

		// Find the lead by id_user / phone number
		let lead = await Leads.findOne({ id_user: userPhone });

		// If the lead does not exist for that phone, create it && save message && greet the user
		if (lead === null) {
			// Obtain current date and hour
			const currentDateTime = new Date().toLocaleString("es-AR", {
				timeZone: "America/Argentina/Buenos_Aires",
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
			lead = await Leads.create({
				name: name ? name : "WhatsApp User",
				id_user: userPhone,
				content: `${currentDateTime} - ${name}: ${message}\n${currentDateTime} - MegaBot: ¡Hola ${name}${greeting}`,
				botSwitch: "ON",
				channel: channel,
			});
			console.log("Lead created in Leads DB");

			// Post greeting to the new customer
			await handleWhatsappGreeting(name, userPhone);

			// Create a Thread sending user message and greeting to GPT
			const thread = await createGptThread(name, message);

			// Save thread in DB
			lead.thread_id = thread;
			await lead.save();
			console.log("Lead updated with threadId");

			res.status(200).send("EVENT_RECEIVED");
		} else {
			next();
		}
		/* else if (typeOfWhatsappMessage === "audio") {
			console.log("Entre en else if de audio");
			const audioObject = body.entry[0].changes[0].value.messages[0].audio ? body.entry[0].changes[0].value.messages[0].audio : "otro formato" 
			console.log("Objeto Audio", audioObject)
			const value = body.entry[0].changes[0].value
			console.log("Value", value) 
			const audioId = audioObject.id
			console.log("Audio Id:", audioId)
			// Make a get request to access the audio URL
			const audioUrl = await getAudioWhatsappUrl(audioId)
			console.log("AudioURL:", audioUrl.data.url)

			//----ESTO DESPUES SACARLO!! TIENE QUE HACER EL RES CON LA RESPUESTA DEL GPT ----//
			res.status(200).send("EVENT_RECEIVED")
			// Download the URL

		} */
	} else {
		console.log("Object received from WhatsApp API not processed by this API:", body);
		res.status(200).send("EVENT_RECEIVED");
	}
};
