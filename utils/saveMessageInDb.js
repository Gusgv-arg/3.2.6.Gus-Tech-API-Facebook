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
		
		// If the lead does not exist for that thread, create it and return.
		if (lead === null) {
			lead = await Leads.create({
				name: "Messenger user name",
				id_user: sender_psid,
				content: `Usuario ${sender_psid}: ${userMessage}`,
				thread_id: threadId,
				botSwitch: "ON",
				channel: channel
			});
			console.log("Lead created in Leads DB");
			return;
		}

		// Concatenate the new message to the existing content
		// If there is name its because is GPT
		let newContent
		if (name){
			newContent = `${lead.content}\n${name}: ${userMessage}\n`;
		} else {
			newContent = `${lead.content}\nUsuario: ${userMessage}`;
		}

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
