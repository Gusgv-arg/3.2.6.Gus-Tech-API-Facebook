

export const postWhatsappWebhookController = async (req, res) =>{

    const body = req.body;
	console.log("Lo que recibo x WhatsApp de la API de facebook -->", body);
    console.log("body.entry[0].changes[0]:", body.entry[0].changes[0])

    res.status(200). send("Received")
}