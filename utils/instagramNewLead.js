import Leads from "../models/leads.js";
import { greeting, messengerGreeting } from "./greeting.js";
import { createGptThread } from "./createGptThread.js";
import dotenv from "dotenv";
import { handleMessengerMaxResponses } from "./handleMessengerMaxResponses.js";
import { newLeadWhatsAppNotification } from "./newLeadWhatsAppNotification.js";
import { handleInstagramGreeting } from "./handleInstagramGreeting.js";
import { handleInstagramMaxResponses } from "./handleInstagramMaxresponses.js";

dotenv.config();

const maxResponses = process.env.MAX_RESPONSES;

export const instagramNewLead = async (newMessage, senderId) => {
	//console.log("newMessage en instagramNewLead.js:", newMessage);

	const currentDateTime = new Date().toLocaleString("es-AR", {
		timeZone: "America/Argentina/Buenos_Aires",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	try {
		// Primero, intentamos encontrar el lead existente
		let lead = await Leads.findOne({ id_user: senderId });

		if (lead === null) {
			// Si no existe, creamos un nuevo lead
			lead = await Leads.create({
				id_user: senderId,
				name: newMessage.name,
				content: `${currentDateTime} - ${newMessage.name}: ${newMessage.message}\n${currentDateTime} - MegaBot: ${messengerGreeting}`,
				instagramMid: [newMessage.instagramMid],
				botSwitch: "ON",
				channel: newMessage.channel,
				responses: 1,
			});

			console.log("Lead created in Leads DB!!:", newMessage.name);

			await handleInstagramGreeting(senderId);

			const thread = await createGptThread(
				newMessage.name,
				newMessage.message,
				newMessage.channel
			);
			lead.thread_id = thread;
			await lead.save();
			console.log("Lead updated with threadId!!");

			newLeadWhatsAppNotification(newMessage.channel, newMessage.name);
			console.log("Lead creation notification sent to Admin!!");

			return false;
			
		} else {
			// Si el lead ya existe, actualizamos
			if (!lead.instagramMid.includes(newMessage.instagramMid)) {
				lead.instagramMid.push(newMessage.instagramMid);
				await lead.save();

				if (lead.responses > maxResponses && senderId !== "1349568352682541") {
					console.log("User reached max allowed responses");
					await handleInstagramMaxResponses(senderId);
					return false;
				}

				if (lead.botSwitch === "OFF") {
					return false;
				}

				return true;
			} else {
				console.log("Skipping duplicated MID: ", newMessage.instagramMid);
				return false;
			}
		}
	} catch (error) {
		console.error("Error in instagramNewLead.js:", error);
	}
};
