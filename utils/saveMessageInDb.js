import Leads from "../models/leads.js";
import { logError } from "./logError.js";

export const saveMessageInDb = async (
	senderId,
	messageGpt,
	threadId,
	newMessage,
	campaignFlag,
	flowFlag,
	flowToken
) => {
	// Save the sent message to the database
	let currentFlow;

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

			let newContent;

			// Determine wether it's a general thread, campaign or flow
			if (campaignFlag === false && flowFlag === false) {
				// Concatenate in the general thread the new messages from user && GPT to the existing content
				newContent = `${lead.content}\n${currentDateTime} - ${newMessage.name}: ${newMessage.message}\nMegaBot: ${messageGpt}`;

				// Update the lead content in the general thread
				lead.content = newContent;
				lead.channel = newMessage.channel;
				lead.thread_id = threadId;
				lead.responses = lead.responses + 1;

				// Save the updated lead
				await lead.save();
				console.log(
					"Lead in GENERAL THREAD updated with GPT message in Leads DB"
				);
				return;
			} else if (campaignFlag === true) {
				// Look for Campaign in the array of Campaigns
				const currentCampaign = lead.campaigns.find(
					(campaign) => campaign.campaignThreadId === threadId
				);

				if (!currentCampaign) {
					console.log("Campaign not found for this thread");
					return;
				}

				// Concatenate the campaign message with the previous ones
				const newMessageContent = `\n${currentDateTime} - ${newMessage.name}: ${newMessage.message}\nMegaBot: ${messageGpt}`;

				// Replace the messages history with the new one
				currentCampaign.messages = currentCampaign.messages
					? currentCampaign.messages + newMessageContent
					: newMessageContent;

				// Update Campaign status
				currentCampaign.client_status = "respuesta";

				// Clean error if it existed
				if (currentCampaign.error) {
					currentCampaign.error = null;
				}

				// Update lead
				await lead.save();
				console.log("Lead updated with CAMPAIGN message in Leads DB");
				return;
			} else if (flowFlag === true) {
				// Look for Flow in the array of Flows
				currentFlow = lead.flows.find((flow) => flow.flowThreadId === threadId);

				if (!currentFlow) {
					console.log("Flow not found for this thread");
					return;
				}

				// Concatenate the Flow message with the previous ones
				const newMessageContent = `\n${currentDateTime} - ${newMessage.name}: ${newMessage.message}\nMegaBot: ${messageGpt}`;

				// Replace the messages history with the new one
				currentFlow.messages = currentFlow.messages
					? currentFlow.messages + newMessageContent
					: newMessageContent;

				// Update Flow Token
				currentFlow.flow_token = flowToken;

				// Update Flow status && history
				if (messageGpt.includes("IMPORTANTE:")) {
					if (messageGpt.includes("DNI") && messageGpt.includes("modelo")) {
						currentFlow.client_status = "faltan modelo y DNI";
						currentFlow.history += `${currentDateTime}: Status Cliente: Faltan modelo y DNI. `;
					
					} else if (messageGpt.includes("modelo")) {
						currentFlow.client_status = "falta modelo";
						currentFlow.history += `${currentDateTime}: Status Cliente: Falta Modelo. `;
					} else if (messageGpt.includes("DNI")) {
						currentFlow.client_status = "falta DNI";
						currentFlow.history += `${currentDateTime}: Status Cliente: Falta DNI. `;
					}
				} else if (messageGpt.includes("¡Gracias por confiar en Megamoto!")) {
					currentFlow.client_status = "respuesta";
					currentFlow.history += `${currentDateTime}: Status Cliente: Respuesta. `;
				}

				// Clean error if it existed
				if (currentFlow.error) {
					currentFlow.error = null;
				}

				// Update lead
				await lead.save();
				console.log("Lead updated with FLOW message in Leads DB");
				return;
			} else {
				console.log(
					"there is no campaign or flow flag so nothing was stored in DB!!"
				);
				return;
			}
		}
	} catch (error) {
		logError(error, "An error occured while saving message in Messages DB");
		throw new Error(error.message);
	}
};
