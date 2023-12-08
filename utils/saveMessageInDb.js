import Leads from "../models/leads.js";
import { logError } from "./logError.js";

export const saveMessageInDb = async (
	sender_psid,
	userMessage,
	threadId,
	name,
	channel
) => {
	// Save the sent message to the database
	try {
		// Find the lead by threadId
		let lead = await Leads.findOne({ thread_id: threadId });
		
		// If the lead does not exist for that thread, create it and return
		if (lead === null) {
			lead = await Leads.create({
				id_user: sender_psid,
				content: `Usuario ${sender_psid}: ${userMessage}\n`,
				thread_id: threadId,
			});
			console.log("Lead created in Leads DB");
			return;
		}

		// Concatenate the new message to the existing content
		const newContent = `${lead.content}\n ${userMessage}\n`;

		// Update the lead content
		lead.content = newContent;
		lead.channel = channel;

		// Save the updated lead
		await lead.save();
		console.log("Lead updated in Leads DB");

		return;
	} catch (error) {
		logError(error, "An error occured while saving message in Messages DB");
		throw new Error(error.message);
	}
};
