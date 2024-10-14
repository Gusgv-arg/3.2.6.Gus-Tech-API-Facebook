import dotenv from "dotenv";

dotenv.config();

// With a GET Facebook verifies my Messenger webhook
export const getInstagramWebhookController = (req, res) => {
	let INSTAGRAM_VERIFY_TOKEN = process.env.INSTAGRAM_MY_VERIFY_TOKEN;
	console.log("req.query", req.query);
	console.log("req.body", req.body);

	// Parse the query params
	let mode = req.query["hub.mode"];
	let token = req.query["hub.verify_token"];
	let challenge = req.query["hub.challenge"];

	if (mode && token) {
		// Check the mode and token sent is correct
		if (mode === "subscribe" && token === INSTAGRAM_VERIFY_TOKEN) {
			// Respond with the challenge token from the request
			console.log("INSTAGRAM WEBHOOK VERIFIED");
			res.status(200).send(challenge);
		} else {
			// Respond with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
		}
	} else {
		res.sendStatus(403);
	}
};
