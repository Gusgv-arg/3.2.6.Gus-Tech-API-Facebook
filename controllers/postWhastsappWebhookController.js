

export const postWhatsappWebhookController = async (req, res) =>{

    const body = req.body;
	console.log("Lo que recibo x WhatsApp de la API de facebook -->", body);

    res.status(200). send("Received")
}