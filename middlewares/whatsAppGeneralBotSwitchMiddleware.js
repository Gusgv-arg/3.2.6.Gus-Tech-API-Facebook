import axios from "axios";
import BotSwitch from "../models/botSwitch.js";
import dotenv from "dotenv";
import { userWhatsAppNotification } from "../utils/userWhatsAppNotification.js";

dotenv.config();

const myPhone = process.env.MY_PHONE;

export const whatsAppGeneralBotSwitchMiddleware = async (req, res, next) => {
	const data = req.body;
    const userPhone = data.entry[0].changes[0].value.messages[0].from

	try {
		let botSwitchInstance = await BotSwitch.findOne();
		// Next() if general switch is ON or message is not from Admin
		if (botSwitchInstance.generalSwitch === "ON" || userPhone === myPhone) {
			next();
		
        // General Bot Switch is off
		} else {
			console.log(
				"Exiting the process, General Bot Switch is turned OFF. MegaBot is stopped!"
			);
			
            // Notify user that MegaBot is off
            const notification = `¡Hola! Te pedimos disculpas, en estos momentos me encuentro apagado. Podes contactarte más tarde o contactarnos al ${myPhone}. ¡Gracias!`
			userWhatsAppNotification(userPhone, notification)

			res.status(200).send("EVENT_RECEIVED")
		}
	} catch (error) { 
		console.log(
			"An error ocurred in checkgeneralBotSwitchMiddleware.js when looking general switch"
		);
		throw error;
	}
};
