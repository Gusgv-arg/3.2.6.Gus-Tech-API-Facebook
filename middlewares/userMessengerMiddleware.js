import Leads from "../models/leads.js";
import { greeting } from "../utils/greeting.js";
import { createGptThread } from "../utils/createGptThread.js";
import { handleWhatsappGreeting } from "../utils/handleWhatsappGreeting.js";

// Middleware that only creates the user in DB if it doesn't exist or next()
export const userMessengerMiddleware = async (req, res, next) => {
	const body = req.body;
	console.log("Lo que recibo de la API de facebook -->", body);
	let channel = body.entry[0].changes ? "WhatsApp" : "Messenger";
	console.log("Channel:", channel);
	let status = body?.entry?.[0].changes?.[0].value?.statuses?.[0]
		? "status"
		: null;

	if (channel === "WhatsApp") {
		console.log(
			"Whatsapp --->",
			body?.entry?.[0].changes?.[0].value?.statuses?.[0]
				? `Status: ${body.entry[0].changes[0].value.statuses[0].status}`
				: `Mensaje nuevo!: ${body.entry[0].changes[0].value.messages[0]}`
		);
		if (status !== null) {
			res.status(200).send("EVENT_RECEIVED");
			return;
		}
	} else if (channel === "Messenger" && body?.entry[0]?.messaging[0]) {
		console.log(
			"Messenger --> body.entry[0].messaging[0] -->",
			body.entry[0].messaging[0]
		);
	} else {
		console.log("Other object");
	}

	// ------ WhatsApp --------//
	if (channel === "WhatsApp" && body?.entry[0]) {
		let typeOfWhatsappMessage = body.entry[0].changes[0]?.value?.messages[0]
			?.type
			? body.entry[0].changes[0].value.messages[0].type
			: "other type";
		console.log("Type of WA message:", typeOfWhatsappMessage);

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
			message = "Message with another format than audio or text"
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
		//-------- Messenger ----------//
	} else if (channel === "Messenger" && body?.object === "page") {
		const senderId = body?.entry[0]?.messaging[0].sender.id;
		const messengerMessage = body?.entry[0]?.messaging[0].message.text;
		const name = "Messenger user";

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

		// Find the lead by id
		let lead = await Leads.findOne({ id_user: senderId });
		if (lead === null) {
			lead = await Leads.create({
				name: name,
				id_user: senderId,
				content: `${currentDateTime} - ${name}: ${messengerMessage}`,
				botSwitch: "ON",
				channel: channel,
			});
			console.log("Lead created in Leads DB");
			next();
		} else {			
			next();
		}
	} else {
		console.log("Not processed by API:", body);
		res.status(200).send("EVENT_RECEIVED");
	}
};