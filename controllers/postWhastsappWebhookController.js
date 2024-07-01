export const postWhatsappWebhookController = async (req, res) => {
	const body = req.body;
	console.log("Lo que recibo x WhatsApp de la API de facebook -->", body);
	//console.log("body.entry[0].changes[0]:", body.entry[0].changes[0]);
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

	console.log(
		"body.entry[0].changes[0].value.contacts[0]:",
		body.entry[0].changes[0].value.contacts[0]
	); 
	/* Object received
        {
            profile: { name: 'gustavo gomez villafane' },
            wa_id: '5491161405589'
        }
    */
	//console.log("body.entry[0].changes[0].value.messages[0]:", body.entry[0].changes[0].value.messages[0]);
	/*  Object received
        {
            from: '5491161405589',
            id: 'wamid.HBgNNTQ5MTE2MTQwNTU4ORUCABIYEjc4NzVFMkNFMDQ4REE5OTlERgA=',
            timestamp: '1719857256',
            text: { body: 'todo bien?' },
            type: 'text'
        }
    */
	//const userName = body.entry[0].changes[0].value.contacts[0].profile.name;
	//console.log("User name-->", userName);
	const userMessage = body.entry[0].changes[0].value.messages[0].text.body;
	console.log("User message-->", userMessage);
	const userMessageId = body.entry[0].changes[0].value.messages[0].id;
	console.log("User message ID-->", userMessageId);
	const userPhone = body.entry[0].changes[0].value.messages[0].from;
	console.log("User message phone-->", userPhone);

	res.status(200).send("Received");
};
