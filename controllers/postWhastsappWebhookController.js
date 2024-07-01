

export const postWhatsappWebhookController = async (req, res) =>{

    const body = req.body;
	console.log("Lo que recibo x WhatsApp de la API de facebook -->", body);
    console.log("body.entry[0].changes[0]:", body.entry[0].changes[0])
    /* Object received
    {
        value:
        {
            messaging_product: 'whatsapp',
            metadata:
            {
                display_phone_number: '15550480577', --> phone from where the msge is sent
                phone_number_id: '312359751967984'
            },
            contacts: [ [Object] ],
            messages: [ [Object] ]
        },
        field: 'messages'
    } */

   console.log("body.entry[0].changes[0].value.contacts[0]:", body.entry[0].changes[0].value.contacts[0])
   console.log("body.entry[0].changes[0].value.messages[0]:", body.entry[0].changes[0].value.messages[0])

    res.status(200). send("Received")
}