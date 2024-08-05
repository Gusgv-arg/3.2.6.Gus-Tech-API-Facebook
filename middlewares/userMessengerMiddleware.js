import Leads from "../models/leads.js";
import { greeting } from "../utils/greeting.js";
import { createGptThread } from "../utils/createGptThread.js";

// Middleware that creates the user in DB if it doesn't exist || next()
export const userMessengerMiddleware = async (req, res, next) => {
	const body = req.body;
	console.log("Lo que recibo de la API de Messenger -->", body);
	let channel = body.entry[0].changes ? "WhatsApp" : "Messenger";
	console.log("Channel:", channel);

	if (channel === "Messenger" && body?.entry[0]?.messaging[0]) {
		console.log(
			"Messenger --> body.entry[0].messaging[0] -->",
			body.entry[0].messaging[0]
		);
	} else {
		console.log("Other object");
	}

	if (channel === "Messenger" && body?.object === "page") {
		const senderId = body?.entry[0]?.messaging[0].sender.id;
		const messengerMessage = body?.entry[0]?.messaging[0].message.text;
		const name = "Messenger user";

		// Find the lead by id
		let lead = await Leads.findOne({ id_user: senderId });

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
				name: name,
				id_user: senderId,
				content: `${currentDateTime} - ${name}: ${messengerMessage}`,
				botSwitch: "ON",
				channel: channel,
			});
			console.log("Lead created in Leads DB");

			// Post greeting to the new customer
			await handleMessengerGreeting(senderId);

			// Create a Thread sending user message and greeting to GPT
			const thread = await createGptThread(name, messengerMessage, channel);

			res.status(200).send("EVENT_RECEIVED");
		} else {
			next();
		}
	} else {
		console.log("Not processed by API:", body);
		res.status(200).send("EVENT_RECEIVED");
	}
};
