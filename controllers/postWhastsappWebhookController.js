import axios from "axios";

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

	/* console.log(
		"body.entry[0].changes[0].value.contacts[0]:",
		body.entry[0].changes[0].value.contacts[0]
	); */ 
	/* Object received
        {
            profile: { name: 'gustavo gomez villafane' },
            wa_id: '5491161405589'
        }
    */
   const userName = body.entry[0]?.changes[0]?.value?.contacts[0]?.profile?.name;
   console.log("User name-->", userName);
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
	const userMessage = body.entry[0].changes[0].value.messages[0].text.body;
	console.log("User message-->", userMessage);
	const userMessageId = body.entry[0].changes[0].value.messages[0].id;
	console.log("User message ID-->", userMessageId);
	const userPhone = body.entry[0].changes[0].value.messages[0].from;
	console.log("User message phone-->", userPhone);

    const myPhoneNumberId="312359751967984" // este es el id de mi cel declarado en la api
    const whatsappToken = "EAAOCUBAegw4BO4SHrHMKt4ieYqAin3xm0kFSwRyGzxXabXRgpMFFOHX6LO6m6oUSRjwRZCwJdx9J3u30EnC3VizlGZAgnKnSoPaCZCCQEpasWkCb24XtsBiZBTT9fEZCUXFZBYJKQdBRyDVF9hZAyqeQs2tQAicoCEO4HsYiWZBj9OPKMWzrpwTEKM3UGLtxDRMomzqIzC2XLWcIjDct"
    const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`
    const data = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": userPhone,
        "type": "text",
        "text": {
          "preview_url": true,
          "body": "Hola desde https://www.gus-tech.com"
        }
      }

    const response = await axios
        .post(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((response) => {
            console.log("Response from Facebook:", response.data);
        })
        .catch((error) => {
            console.error(
                "Error enviando a Facebook------------>",
                error.response ? error.response.data : error.message
            );
        });

	res.status(200).send("Received");
};
