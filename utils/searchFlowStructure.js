// Searches Flow structure to return format por post request

export const searchFlowStructure = (templateName, columnB, columnC) => {
	// Generate a flow token && parameters to identify the flow among others
	let flowToken;
	let components;
	let language;

	if (templateName === "flow6") {
		flowToken = 1;
		(components = [
			{
				type: "body",
				parameters: [
					{
						type: "text",
						text: columnB,
					},
				],
			},
			{
				type: "BUTTON",
				sub_type: "flow",
				index: "0",
				parameters: [{ type: "action", action: { flow_token: flowToken } }],
			},
		]),
			(language = "es");
		//console.log("Components:", components);
		//console.log("Language:", language);

		return { components, language };
	
    } else if (templateName === "flow9") {
		flowToken = 2;
		(components = [
			{
				type: "header",
				parameters: [
					{
						type: "image",
						image: {
							link: "https://github.com/Gusgv-arg/3.2.10.MEGAMOTO-Campania-WhatsApp/blob/main/assets/foto_campa%C3%B1a_pedidosya.jpg?raw=true",
						},
					},
				],
			},
			{
				type: "body",
				parameters: [
					{
						type: "text",
						text: columnB,
					},
				],
			},
			{
				type: "BUTTON",
				sub_type: "flow",
				index: "0",
				parameters: [{ type: "action", action: { flow_token: flowToken } }],
			},
		])
        
        language = "es";
        
		return { components, language };
	
    } else {
		flowToken = 0;
		console.log("Cannot find template in searchFlowStructure.js");
		return;
	}
};
