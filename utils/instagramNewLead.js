import Leads from "../models/leads.js";
import { greeting, messengerGreeting } from "./greeting.js";
import { createGptThread } from "./createGptThread.js";
import { handleMessengerGreeting } from "./handleMessengerGreeting.js";
import dotenv from "dotenv";
import { handleMessengerMaxResponses } from "./handleMessengerMaxResponses.js";
import { newLeadWhatsAppNotification } from "./newLeadWhatsAppNotification.js";

const maxResponses = process.env.MAX_RESPONSES;

export const instagramNewLead = async (newMessage, senderId) => {
	
	console.log("newMessage en instagramNewLead.js:", newMessage)
	
	
	const currentDateTime = new Date().toLocaleString("es-AR", {
		timeZone: "America/Argentina/Buenos_Aires",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	/* try {
		// Primero, intentamos encontrar el lead existente
		let lead = await Leads.findOne({ id_user: senderId });

		if (lead === null) {
			// Si no existe, creamos un nuevo lead
			lead = await Leads.create({
				id_user: senderId,
				name: name,
				content: `${currentDateTime} - ${name}: ${instagramMessage}\n${currentDateTime} - MegaBot: ${messengerGreeting}`,
				instagramMid: [instagramMessageId],
				botSwitch: "ON",
				channel: channel,
				responses: 1,
			});

			console.log("Lead created in Leads DB!!:", name);
			await handleMessengerGreeting(senderId);
			const thread = await createGptThread(name, instagramMessage, channel);
			lead.thread_id = thread;
			await lead.save();
			console.log("Lead updated with threadId!!");
			newLeadWhatsAppNotification(channel, name);
			console.log("Lead creation notification sent to Admin!!");
		} else {
			// Si el lead ya existe, actualizamos
			if (!lead.instagramMid.includes(instagramMessageId)) {
				lead.instagramMid.push(instagramMessageId);

				if (lead.responses > maxResponses && senderId !== "1349568352682541") {
					console.log("User reached max allowed responses");
					await handleMessengerMaxResponses(senderId);
					return res.status(200).send("EVENT_RECEIVED");
				}

				if (lead.botSwitch === "OFF") {
					return res.status(200).send("EVENT_RECEIVED");
				}

				await lead.save();
			} else {
				console.log("Mensaje duplicado detectado. Ignorando.");
				return res.status(200).send("EVENT_RECEIVED");
			}
		}
		
	} catch (error) {
		console.error("Error in instagramNewLead.js:", error);
		res.status(500).send("Internal Server Error");
	} */
};
