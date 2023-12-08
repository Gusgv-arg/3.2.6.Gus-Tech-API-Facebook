import { doesNotThrow } from "assert";
import dotenv from "dotenv"

dotenv.config()

//Facebook hace un GET y verifica que mi clave FACEBOOK_MY_VERIFY_TOKEN coincida con la cargada en la APP
export const getMessengerWebhookController = (req, res) => {
	let VERIFY_TOKEN = process.env.FACEBOOK_MY_VERIFY_TOKEN
    
    // Parse the query params
	let mode = req.query["hub.mode"];
	let token = req.query["hub.verify_token"];
	let challenge = req.query["hub.challenge"];

	// Check if a token and mode is in the query string of the request
	if (mode && token) {
		// Check the mode and token sent is correct
		if (mode === "subscribe" && token === VERIFY_TOKEN) {
			// Respond with the challenge token from the request
			console.log("WEBHOOK_VERIFIED");
			res.status(200).send(challenge);
		} else {
			// Respond with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
		}
	}
};
