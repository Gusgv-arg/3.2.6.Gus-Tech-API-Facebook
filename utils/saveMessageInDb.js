import Leads from "../models/leads.js";
import { logError } from "./logError.js";

export const saveMessageInDb = async (
	senderId,
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
				name: userMessage.name ? userMessage.name : "Messenger user",
				id_user: senderId,
				content: `Usuario ${senderId}: ${userMessage}`,
				thread_id: threadId,
				botSwitch: "ON",
				channel: channel
			});
			console.log("Lead created in Leads DB");
			return;
		}

		// Obtain current date and hour
		const currentDateTime = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
		
		// Concatenate the new message to the existing content
		let newContent
		// If there is name its because is GPT
		if (name){
			newContent = `${lead.content}\n${currentDateTime} - ${name}: ${userMessage}\n`;
		} else {
			newContent = `${lead.content}\n${currentDateTime} - Usuario: ${userMessage}`;
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
