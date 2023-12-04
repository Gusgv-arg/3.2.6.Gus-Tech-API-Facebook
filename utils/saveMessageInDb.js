import Messages from "../models/messages.js";
import Leads from "../models/leads.js";
import { logError } from "./logError.js";

export const saveMessageInDb = async (
	name,
	senderId,
	role,
	messageGpt,
	messageId,
	channel,
	threadId
) => {
	// Save the sent message to the database
	try {
		// saves message in Messages DB (stores everything)
		await Messages.create({
			name: name,
			id_user: senderId,
			role: role,
			content: messageGpt,
			id_message: messageId,
			channel: channel,
			thread_id: threadId,
		});
		console.log("Message saved in Messages DB");

		// Find the lead by threadId
		let lead = await Leads.findOne({ thread_id: threadId });
		console.log("lead", lead)

		// If the lead does not exist for that thread, create it and return
		if (lead===null) {
			lead = await Leads.create({
				name: name,
				id_user: senderId,
				channel: channel,
				content: `${name}: ${messageGpt}\n`,
				thread_id: threadId,
			});
			console.log("Lead created in Leads DB");
			return
		}

		// Concatenate the new message to the existing content
		const newContent = `${lead.content}\n${name}: ${messageGpt}\n`;

		// Update the lead content
		lead.content = newContent;

		// Save the updated lead
		await lead.save();
		console.log("Lead updated in Leads DB");

		return;
	} catch (error) {
		logError(error, "An error occured while saving message in Messages DB");
		throw new Error(error.message);
	}
};
