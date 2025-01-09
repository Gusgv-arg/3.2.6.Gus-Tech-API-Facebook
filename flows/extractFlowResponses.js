import { extractFlowToken_1Responses } from "./extractFlowToken_1Responses.js";
import { extractFlowToken_2Responses } from "./extractFlowToken_2Responses.js";

export const extractFlowResponses = (userMessage, userName) => {
	let finalNotification = "";

	if (userMessage.includes('"flow_token":"1"')) {
		// FLOW_TOKEN = 1
		//console.log(greet);
		const extraction = extractFlowToken_1Responses(userMessage);
		console.log("extraction en extractFlowResponses:", extraction)

		// Verificar si extraction comienza con "¡IMPORTANTE!"
		if (extraction.includes("IMPORTANTE:")) {
			finalNotification = `*¡Hola ${userName} 👋!*\n${extraction}`; 
			return finalNotification; 
		} else {
			const greet = `*¡Hola ${userName} 👋!* En breve te va a contactar un vendedor por tu consulta:\n\n`;
			finalNotification = greet + extraction;
			console.log("finalNotification en extractFlowResponses:", finalNotification)
			return finalNotification; 
		}
		
	} else if (userMessage.includes('"flow_token":"2"')) {
		// FLOW_TOKEN = 2
		const responses = extractFlowToken_2Responses(userMessage)
		const {extraction, flowToken} = responses
		finalNotification = extraction
		return {finalNotification, flowToken};

	} else {
		console.log("No se encontró el Flow Token");
		return;
	}
};

/* extractFlowResponses(
	'{"DNI":"52225","Seleccionar lo que corresponda":["Préstamo Prendario"],"TVS":"NEO XR 110","Teknial":"TK-REVOLT","flow_token":"1"}',
	"Gustavo"
); */
