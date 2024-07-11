import Leads from "../models/leads.js";
import { greeting } from "../utils/greeting.js";
import { createGptThread } from "../utils/createGptThread.js";
import { handleWhatsappGreeting } from "../utils/handleWhatsappGreeting.js";

export const userMiddleware = async (req, res, next) => {
	const body = req.body;
	console.log("Lo que recibo x WhatsApp de la API de facebook -->", body);
	console.log("Changes -->", body.entry[0].changes[0]);

	if (body.entry[0].changes[0].value.statuses) {
		console.log("Statuses--->", body.entry[0].changes[0].value.statuses[0]);
	}

	if (body.entry[0]) {
		if (
			body.entry &&
			body.entry[0].changes &&
			body.entry[0].changes[0].value.messages &&
			body.entry[0].changes[0].value.messages[0]
		) {
			const message = body.entry[0].changes[0].value.messages[0].text.body;
			const userPhone = body.entry[0].changes[0].value.messages[0].from;
			const channel = "whatsapp";
			const name = body.entry[0].changes[0].value.contacts[0].profile.name;
			console.log("User name----->", name);
			console.log("User message-->", message);
			console.log("User phone---->", userPhone);

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

			// Find the lead by id_user / phone number
			let lead = await Leads.findOne({ id_user: userPhone });

			// If the lead does not exist for that phone, create it && save message && greeting
			if (lead === null) {
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
				const thread = await createGptThread(name, message)

				// Save thread in DB
				lead.thread_id = thread
				await lead.save();
				console.log("Lead updated with threadId");

				res.status(200).send("EVENT_RECEIVED");
			} else {
				// Concatenate the new message to the existing content
				let newContent;
				newContent = `${lead.content}\n${currentDateTime} - ${name}: ${message}\n`;

				// Update the lead content
				lead.content = newContent;

				// Save the updated lead
				await lead.save();
				console.log("Lead updated with user message in Leads DB");
				next();
			}
		}
	} else {
		console.log("Not processed by API:", body);
		res.status(400).send("Not processed by this API");
	}
};
