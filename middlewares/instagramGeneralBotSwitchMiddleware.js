import axios from "axios";
import BotSwitch from "../models/botSwitch.js";
import dotenv from "dotenv";
import { errorMessage1 } from "../utils/errorMessages.js";
import { handleInstagramMessage } from "../utils/handleInstagramMessage.js";

dotenv.config();

const myPhone = process.env.MY_PHONE;

export const instagramGeneralBotSwitchMiddleware = async (req, res, next) => {
	const body = req.body;
	const senderId = body?.entry?.[0]?.messaging?.[0]?.sender?.id || "";

	try {
		let botSwitchInstance = await BotSwitch.findOne();
		// Next() if general switch is ON or message is not from Admin
		if (botSwitchInstance.generalSwitch === "ON") {
			next();

			// General Bot Switch is off
		} else {
			console.log(
				"Exiting the process, General Bot Switch is turned OFF. MegaBot is stopped!"
			);

			// Notify user that MegaBot is off
			if (senderId !== ""){
				await handleInstagramMessage(senderId, errorMessage1);
				res.status(200).send("EVENT_RECEIVED");
				return
			} else {
				res.status(200).send("EVENT_RECEIVED");
				return
			}

		}
	} catch (error) {
		console.log(
			"An error ocurred in instagramGeneralBotSwitchMiddleware.js when looking general switch"
		);
		throw error;
	}
};
