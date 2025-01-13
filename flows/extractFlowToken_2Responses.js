export const extractFlowToken_2Responses = (userMessage) => {
	let extraction = "";

	// Extraer la respuesta del vendedor
	const regex = /"Tomar Lead":"([^"]+)"/;
	const atención = userMessage.match(regex);
	extraction += `Respuesta del Vendedor: ${atención[1]}\n`;
	
	// Derivación del vendedor
	const regex0 = /"Derivar Lead":"([^"]+)"/;
	const derivar = userMessage.match(regex0);
	extraction += `Derivación a Vendedor: ${derivar[1]}\n`;

	// Extraer notas del vendedor
	const regex1 = /"Notas sobre el lead":"([^"]+)"/;
	const notas = userMessage.match(regex1);
	extraction += `Notas del Vendedor: ${notas[1]}\n`;

	// Extraer token
	const regex2 = /"flow_token":"([^"]+)"/;
	const flowToken = userMessage.match(regex2)[1];
	console.log(extraction)
	return { extraction, flowToken };
};

/* extractFlowToken_2Responses('{"Tomar Lead":"Atender", "Derivar Lead":"Vendedor 1", "Notas sobre el lead":"Hola","flow_token":"2c2fd2ec9-3723-46c7-985f-332e11bc1fd4"}'); */