import { extractFlowToken_1Responses } from "./extractFlowToken_1Responses.js";

export const extractFlowResponses = (userMessage, userName) => {
	let finalNotification = "";

	if (userMessage.includes('"flow_token":"1"')) {
		// FLOW_TOKEN = 1
		//console.log(greet);
		const extraction = extractFlowToken_1Responses(userMessage);
		
		// Verificar si extraction comienza con "¡IMPORTANTE!"
		if (extraction.includes("IMPORTANTE:")) {
			return `*¡Hola ${userName} 👋!*\n${extraction}`; 
		} else {
			const greet = `*¡Hola ${userName} 👋!* En breve te va a contactar un vendedor por tu consulta:\n\n`;
			finalNotification = greet + extraction;
			return finalNotification; 
		}
		
	} else if (userMessage.includes('"flow_token":"2"')) {
		// FLOW_TOKEN = 2
		console.log("Hacer la lógica para el flow con token 2");
		return;
	} else {
		console.log("No se encontró el Flow Token");
		return;
	}
};

/* extractFlowResponses(
	'{"DNI":"52225","Seleccionar lo que corresponda":["Préstamo Prendario"],"TVS":"NEO XR 110","Teknial":"TK-REVOLT","flow_token":"1"}',
	"Gustavo"
); */
