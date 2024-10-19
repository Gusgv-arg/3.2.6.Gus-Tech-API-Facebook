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

// Middleware that creates the user in DB if it doesn't exist || next()
export const userInstagramMiddleware = async (req, res, next) => {
	const body = req.body;
	//console.log("Lo que recibo de la API de Instagram -->", body);
	let channel = body.object === "instagram" ? "instagram" : "other";
	let senderId = body?.entry?.[0]?.messaging?.[0]?.sender?.id || "";
	let recipientId = body?.entry?.[0]?.messaging?.[0]?.recipient?.id || "";

	if (channel === "instagram" && body?.entry[0]?.messaging) {
		// console.log("body.entry[0].messaging[0] -->", body.entry[0]?.messaging[0] ?? "No messaging data");
		// console.log("Attachments -->", body?.entry[0]?.messaging[0]?.message?.attachments?.[0] ? body.entry[0].messaging[0].message.attachments[0] : "no attachments");

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

	if ((channel === "instagram") & (senderId !== "")) {
		// Check if iths the owner of the account and return
		if (senderId === ownerInstagramAccount) {
			console.log("Return because is the owner of the account!!");
			res.status(200).send("EVENT_RECEIVED");
			return;
		} else if (recipientId !== ownerInstagramAccount) {
			// Check if its another recipient ID different from our Instagram ID and return
			console.log(
				"Return because the recipient ID is not owrs!! RecipientId:",
				recipientId
			);
			res.status(200).send("EVENT_RECEIVED");
			return;
		}

		const instagramMessage =
			body?.entry?.[0]?.messaging?.[0]?.message?.text ??
			body?.entry?.[0]?.standby?.[0]?.message?.text ??
			"";
		const name = "Instagram user";
		const instagramMessageId = body?.entry?.[0]?.messaging?.[0]?.message?.mid
			? body.entry[0].messaging[0].message.mid
			: "";

		// Find lead by id_user && instagramMid
		let lead = await Leads.findOne({
			id_user: senderId,
			instagramMid: instagramMessageId,
		});

		if (lead) {
			console.log(
				"Exiting because of existing Instagram Mid:",
				instagramMessageId
			);
			return res.status(200).send("EVENT_RECEIVED");
		}

		// Find the lead by id
		lead = await Leads.findOne({ id_user: senderId });

		if (lead === null) {
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

			lead = await Leads.create({
				name: name,
				id_user: senderId,
				content: `${currentDateTime} - ${name}: ${instagramMessage}\n${currentDateTime} - MegaBot: ${messengerGreeting}`,
				instagramMid: [instagramMessageId],
				botSwitch: "ON",
				channel: channel,
				responses: 1,
			});
			console.log("Lead created in Leads DB!!:", name);

			// Post greeting to the new customer
			await handleMessengerGreeting(senderId);

			// Create a Thread sending user message and greeting to GPT
			const thread = await createGptThread(name, instagramMessage, channel);

			// Save thread in DB
			lead.thread_id = thread;
			await lead.save();
			console.log("Lead updated with threadId!!");

			// Send Notification of new lead to Admin
			newLeadWhatsAppNotification(channel, name);
			console.log("Lead creation notification sent to Admin!!");

			res.status(200).send("EVENT_RECEIVED");
		} else {
			
			// Verify existing Mid
			if (lead.instagramMid.includes(instagramMessageId)) {
				console.log("Exiting because existing mid:", instagramMessageId);
				return res.status(200).send("EVENT_RECEIVED");
			}
			
			// Check max allowed responses
			if (
				lead.responses + 1 > maxResponses &&
				senderId !== "1349568352682541"
			) {
				console.log("User reached max allowed responses");
				await handleMessengerMaxResponses(senderId);
				return res.status(200).send("EVENT_RECEIVED");
			}

			// Check individual botSwitch
			if (lead.botSwitch === "OFF") {
				return res.status(200).send("EVENT_RECEIVED");
			}

			lead.instagramMid.push(instagramMessageId);
			await lead.save();
		}

		next();
	} else {
		console.log("Object not processed by API:", body);
		res.status(200).send("EVENT_RECEIVED");
	}
};
