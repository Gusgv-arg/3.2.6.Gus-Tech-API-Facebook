
export const extractFlowResponses = (userMessage, userName) => {

    let notification = `¡Hola ${userName}! En breve te va a contactar un vendedor por tu consulta:\n`;

    if (userMessage.includes('"flow_token":"1"')) {
		// Definir las marcas a buscar
		const marcas = ["Benelli", "Suzuki", "Sym", "Motomel", "Keeway"];
		let marcasEncontradas = [];
		let modelosEncontrados = [];

		// Buscar la marca y el modelo en el string
		marcas.forEach((m) => {
			const regex = new RegExp(`"${m}":"([^"]+)"`, "g");
			let match;
			while ((match = regex.exec(userMessage)) !== null) {
				marcasEncontradas.push(m);
				modelosEncontrados.push(match[1]); // El modelo es el primer grupo capturado
			}
		});

		// Crear la notificación con la información extraída
		if (marcasEncontradas.length > 0) {
			notification = notification + marcasEncontradas
				.map(
					(marca, index) =>
						`Marca: ${marca}\nModelo: ${modelosEncontrados[index]}\n`
				)
				.join("");
		} else {
			notification = "No se encontró información de marca o modelo.";
		}

		// Extraer el método de pago
		const metodoPagoRegex = /"Método de Pago":\s*(\[[^\]]*\])/;
		const metodoPagoMatch = userMessage.match(metodoPagoRegex);
		
		if (metodoPagoMatch && metodoPagoMatch[1]) {
			const metodoPagoArray = JSON.parse(metodoPagoMatch[1]);
			notification += `Método de pago: ${metodoPagoArray.join(", ")}\n`;
		}

		// Extraer el DNI
		const dniRegex = /"DNI":"([^"]+)"/;
		const dniMatch = userMessage.match(dniRegex);
		if (dniMatch && dniMatch[1]) {
			notification += `DNI: ${dniMatch[1]}\n`;
		}

		// Extraer las preguntas o comentarios
		const preguntasRegex = /"Preguntas o comentarios":"([^"]+)"/;
		const preguntasMatch = userMessage.match(preguntasRegex);
		if (preguntasMatch && preguntasMatch[1]) {
			notification += `Preguntas o comentarios: ${preguntasMatch[1]}`;
		}

        notification = notification + `\n\n¡Gracias por confiar en Megamoto!`
	
        console.log(notification);
		return notification;
	}
};

extractFlowResponses(
	'{"Motomel":"Blitz 110","Benelli":"Leoncino 500","Suzuki":"GSX 125","Método de Pago":["Efectivo","Préstamo Personal"],"DNI":"383838383","Preguntas o comentarios":"Hola","flow_token":"1"}', "Gustavo"
);
