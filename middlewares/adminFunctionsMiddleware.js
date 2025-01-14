import dotenv from "dotenv";
import { changeMegaBotSwitch } from "../functions/changeMegaBotSwitch.js";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";
import {
	botSwitchOffNotification,
	botSwitchOnNotification,
	helpFunctionNotification,
	templateError,
} from "../utils/notificationMessages.js";
import { getMediaWhatsappUrl } from "../utils/getMediaWhatsappUrl.js";
import { downloadWhatsAppMedia } from "../utils/downloadWhatsAppMedia.js";
import { processCampaignExcel } from "../functions/processCampaignExcel.js";
import { changeCampaignStatus } from "../utils/changeCampaignStatus.js";
import listCampaigns from "../utils/listCampaigns.js";
import { exportLeadsToExcel } from "../utils/exportLeadsToExcel.js";
import { processFlowExcel } from "../functions/processFlowExcel.js";

const myPhone = process.env.MY_PHONE;

export const adminFunctionsMiddleware = async (req, res, next) => {
	const body = req.body;
	//console.log("Body desde adminMiddleware", body)

	let channel = body.entry[0].changes ? "WhatsApp" : "Other";
	let status = body?.entry?.[0].changes?.[0].value?.statuses?.[0]
		? "status"
		: null;

	// Return if I receive status update
	if (status !== null) {
		res.status(200).send("EVENT_RECEIVED");
		return;
	}

	// Check if its WhatsApp text message from Admin phone
	if (channel === "WhatsApp" && body?.entry[0]) {
		let typeOfWhatsappMessage = body.entry[0].changes[0]?.value?.messages?.[0]
			?.type
			? body.entry[0].changes[0].value.messages[0].type
			: "other type";

		if (typeOfWhatsappMessage === "other type") {
			//console.log("Other type message entered:", body.entry[0].changes[0]);
			if (
				body.entry[0].changes[0].field === "flows" ||
				body.entry[0].changes[0].field === "message_template_status_update"
			) {
				console.log(
					"Se recibió un evento de flows:",
					body.entry[0].changes[0].value
				);
				res.status(200).send("EVENT_RECEIVED");
				return;
			}
		}

		const userPhone = body?.entry?.[0]?.changes[0]?.value?.messages?.[0]?.from;

		// Admin INSTRUCTIONS: can be text or document format in case of Templates!
		if (
			(typeOfWhatsappMessage === "text" && userPhone === myPhone) ||
			(typeOfWhatsappMessage === "document" && userPhone === myPhone)
		) {
			let message;
			let documentId;

			if (typeOfWhatsappMessage === "text") {
				message =
					body.entry[0].changes[0].value.messages[0].text.body.toLowerCase();
			} else if (typeOfWhatsappMessage === "document") {
				console.log("Entró un document en adminMiddleware.js:", body)
				message =
					body.entry[0].changes[0].value.messages[0].document?.caption.toLowerCase();
				documentId = body.entry[0].changes[0].value.messages[0].document.id;
			}

			if (message === "megabot responder") {
				//Change general switch to ON
				await changeMegaBotSwitch("ON");

				// WhatsApp Admin notification
				await adminWhatsAppNotification(botSwitchOnNotification);

				res.status(200).send("EVENT_RECEIVED");
			} else if (message === "megabot no responder") {
				//Change general switch to OFF
				await changeMegaBotSwitch("OFF");

				// WhatsApp Admin notification
				await adminWhatsAppNotification(botSwitchOffNotification);

				res.status(200).send("EVENT_RECEIVED");
			} else if (message === "megabot") {
				await adminWhatsAppNotification(helpFunctionNotification);

				res.status(200).send("EVENT_RECEIVED");
			} else if (message.startsWith("campaña")) {
				// Campaigns format: "campaña" "template name" "campaign name"
				const parts = message.split(" ");
				const templateName = parts[1];
				const campaignName = parts.slice(2).join("_");

				// Get the Document URL from WhatsApp
				const document = await getMediaWhatsappUrl(documentId);
				const documentUrl = document.data.url;
				//console.log("Document URL:", documentUrl);

				// Download Document from WhatsApp
				const documentBuffer = await downloadWhatsAppMedia(documentUrl);
				const documentBufferData = documentBuffer.data;
				//console.log("Document download:", documentBufferData);

				// Call the new function to process the campaign
				await processCampaignExcel(
					documentBufferData,
					templateName,
					campaignName
				);

				res.status(200).send("EVENT_RECEIVED");
			} else if (message.startsWith("plantilla")) {
				res.status(200).send("EVENT_RECEIVED");

				// Template format: "plantilla" "template name"
				const parts = message.split(" ");
				const templateName = parts[1];
				const campaignName = parts.slice(2).join("_");

				// Get the Document URL from WhatsApp
				const document = await getMediaWhatsappUrl(documentId);
				const documentUrl = document.data.url;
				//console.log("Document URL:", documentUrl);

				// Download Document from WhatsApp
				const documentBuffer = await downloadWhatsAppMedia(documentUrl);
				const documentBufferData = documentBuffer.data;
				//console.log("Document download:", documentBufferData);

				// Call the new function to process the flow
				await processFlowExcel(documentBufferData, templateName);
				
			} else if (message.startsWith("inactivar")) {
				const parts = message.split(" ");
				const campaignName = parts.slice(1).join("_");

				//Call the functions that inactivates Campaign
				await changeCampaignStatus("inactiva", campaignName);

				res.status(200).send("EVENT_RECEIVED");
			} else if (message.startsWith("activar")) {
				const parts = message.split(" ");
				const campaignName = parts.slice(1).join("_");

				//Call the functions that activates Campaign
				await changeCampaignStatus("activa", campaignName);

				res.status(200).send("EVENT_RECEIVED");
			} else if (message === "megabot campañas") {
				await listCampaigns();

				res.status(200).send("EVENT_RECEIVED");
			} else if (message === "megabot leads") {
				const leads = await exportLeadsToExcel();

				res.status(200).send("EVENT_RECEIVED");
			} else {
				// Does next if its an admin message but is not an instruction
				next();
			}
		} else {
			// Does next for any message that differs from text or is not sent by admin
			next();
		}
	} else {
		next();
	}
};
