import Leads from "../models/leads.js";
import { greeting, messengerGreeting } from "../utils/greeting.js";
import { createGptThread } from "../utils/createGptThread.js";
import { handleMessengerGreeting } from "../utils/handleMessengerGreeting.js";
import dotenv from "dotenv";
import { handleMessengerMaxResponses } from "../utils/handleMessengerMaxResponses.js";
import { newLeadWhatsAppNotification } from "../utils/newLeadWhatsAppNotification.js";

dotenv.config();

const maxResponses = process.env.MAX_RESPONSES;
const ownerInstagramAccount = process.env.INSTAGRAM_OWNER_ACCOUNT_ID;

export const userInstagramMiddleware = async (req, res, next) => {
	const body = req.body;
	let channel = body.object === "instagram" ? "instagram" : "other";
	let senderId = body?.entry?.[0]?.messaging?.[0]?.sender?.id || "";
	let recipientId = body?.entry?.[0]?.messaging?.[0]?.recipient?.id || "";

	if (channel !== "instagram" || senderId === "") {
		console.log("Object not processed by API:", body);
		return res.status(200).send("EVENT_RECEIVED");
	}

	// Check if its a message for my account or is a meesage sent by me to my propoer account
	if (senderId === ownerInstagramAccount || recipientId !== ownerInstagramAccount) {
		console.log("Return because of owner account or different recipient ID");
		return res.status(200).send("EVENT_RECEIVED");
	}

	if (channel === "instagram" && body?.entry[0]?.messaging) {
		const type = body?.entry[0]?.messaging[0]?.message?.attachments?.[0]?.type
			? body.entry[0].messaging[0].message.attachments[0].type
			: "text";
		req.type = type;
	} else {
		console.log("Other object--->", body?.entry[0]?.standby || body);
		senderId = body?.entry[0]?.standby[0]?.sender.id
			? body.entry[0].standby[0].sender.id
			: senderId;
	}

	const instagramMessage =
		body?.entry?.[0]?.messaging?.[0]?.message?.text ??
		body?.entry?.[0]?.standby?.[0]?.message?.text ??
		"";
	const name = "Instagram user";
	const instagramMessageId = body?.entry?.[0]?.messaging?.[0]?.message?.mid
		? body.entry[0].messaging[0].message.mid
		: "";

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
		// Function that creates a lead or if it exists it updates it
		const lead = await Leads.findOneAndUpdate(
			{ id_user: senderId },
			{
				$setOnInsert: {
					name: name,
					content: `${currentDateTime} - ${name}: ${instagramMessage}\n${currentDateTime} - MegaBot: ${messengerGreeting}`,
					botSwitch: "ON",
					channel: channel,
					responses: 1,
				},
				$addToSet: { instagramMid: instagramMessageId },
				$inc: { responses: 1 },
			},
			{ new: true, upsert: true }
		);

		if (lead.instagramMid.length === 1) {
			// Es un nuevo lead
			console.log("Lead created in Leads DB!!:", name);
			await handleMessengerGreeting(senderId);
			const thread = await createGptThread(name, instagramMessage, channel);
			lead.thread_id = thread;
			await lead.save();
			console.log("Lead updated with threadId!!");
			newLeadWhatsAppNotification(channel, name);
			console.log("Lead creation notification sent to Admin!!");
		} else {
			// Es un lead existente
			if (lead.responses > maxResponses && senderId !== "1349568352682541") {
				console.log("User reached max allowed responses");
				await handleMessengerMaxResponses(senderId);
				return res.status(200).send("EVENT_RECEIVED");
			}

			if (lead.botSwitch === "OFF") {
				return res.status(200).send("EVENT_RECEIVED");
			}
		}

		next();
	} catch (error) {
		console.error("Error in userInstagramMiddleware:", error);
		res.status(500).send("Internal Server Error");
	}
};