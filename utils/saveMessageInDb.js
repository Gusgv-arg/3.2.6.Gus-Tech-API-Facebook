import Leads from "../models/leads.js";
import { logError } from "./logError.js";

export const saveMessageInDb = async (
	senderId,
	messageGpt,
	threadId,
	name,
	channel
) => {
	// Save the sent message to the database
	try {
		// Find the lead by threadId
		let lead = await Leads.findOne({ id_user: senderId });

		// If the lead does not exist for that thread, there is an error and returns.
		if (lead === null) {
			console.log("¡¡ERROR: Lead not found in DB!!");
			return;
		} else {
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

			// Concatenate the new message to the existing content
			let newContent;
			newContent = `${lead.content}\n${currentDateTime} - ${name}: ${messageGpt}\n`;
			
			// Update the lead content
			lead.content = newContent;
			lead.channel = channel;

			// Save the updated lead
			await lead.save();
			console.log("Lead updated with GPT message in Leads DB");

			return;
		}
	} catch (error) {
		logError(error, "An error occured while saving message in Messages DB");
		throw new Error(error.message);
	}
};
