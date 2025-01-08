export const extractFlowToken_2Responses = (userMessage) => {
	let extraction = "";
	
	// Extraer la respuesta del vendedor
	const regex = /"Atención del Cliente":"([^"]+)"/;
	const atención = userMessage.match(regex);
	extraction += `Respuesta del Vendedor: ${atención[1]}\n`;
	
	console.log(extraction);
	return extraction;
};

//extractFlowToken_2Responses('{"Atención del Cliente":"Atender","flow_token":"2"}')