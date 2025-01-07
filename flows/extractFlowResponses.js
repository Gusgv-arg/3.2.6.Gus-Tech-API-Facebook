import { extractFlowToken1Responses } from "./extractFlowToken1Responses.js";

export const extractFlowResponses = (userMessage, userName) => {
	let finalNotification = "";

	if (userMessage.includes('"flow_token":"1"')) {
		// FLOW_TOKEN = 1
		const greet = `*¡Hola ${userName} 👋!* En breve te va a contactar un vendedor por tu consulta:\n\n`;
		//console.log(greet);
		const extraction = extractFlowToken1Responses(userMessage);
		
		// Verificar si extraction comienza con "¡IMPORTANTE!"
		if (extraction.startsWith("¡IMPORTANTE!")) {
			return extraction; 
		} else {
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
