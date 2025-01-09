export const extractFlowToken_2Responses = (userMessage) => {
	let extraction = "";

	// Extraer la respuesta del vendedor
	const regex = /"Atención del Cliente":"([^"]+)"/;
	const atención = userMessage.match(regex);
	extraction += `Respuesta del Vendedor: ${atención[1]}\n`;

	// Extraer token
	const regex2 = /"flow_token":"([^"]+)"/;
	const flowToken = userMessage.match(regex2)[1];
	console.log("toke", flowToken);

	console.log(extraction);
	return { extraction, flowToken };
};

extractFlowToken_2Responses(
	'{"Atención del Cliente":"Atender","flow_token":"2"}'
);
