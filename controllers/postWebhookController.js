
// Webhook que recibe el mensaje de facebook messenger
export const postWebhookController = (req, res)=>{
    const body = req.body;
	console.log("Lo que recibo de la API de facebook", body)
	
	// Check if this is an event from a page subscription
	if (body.object === "page") {
		
		body.entry.forEach(function(entry){

			// Gets body of the webhook event
			let webhook_event = entry.messaging[0]
			console.log("webhook event", webhook_event)

			// Get the sender PSID
			let sender_psid = webhook_event.sender.sender_psid
			console.log("sender PSID:", sender_psid)
		})		
		
		// Returns a '200 OK' response to all requests
		res.status(200).send("EVENT_RECEIVED");
		
	  } else {
		// Return a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	  }
}