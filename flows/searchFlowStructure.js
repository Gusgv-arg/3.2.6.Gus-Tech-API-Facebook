// Searches Flow structure to return format por post request

export const searchFlowStructure = (templateName, senderId, notification) => {
	// Generate a flow token && parameters to identify the flow among others
	let flowToken;
	let components;
	let language;

	if (templateName === process.env.FLOW_1) {
		flowToken = 1;
		components = [
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
						text: notification,
					},
				],
			},
			{
				type: "BUTTON",
				sub_type: "flow",
				index: "0",
				parameters: [{ type: "action", action: { flow_token: flowToken } }],
			},
		];

		language = "es";

		return { components, language };

	} else if (templateName === process.env.FLOW_2) {
		flowToken = 2;
		components = [			
			{
				type: "header",
				parameters: [
					{
						type: "text",
						text: senderId,
					},
				],
			},
			{
				type: "body",
				parameters: [
					{
						type: "text",
						text: notification,
					},
				],
			},
			{
				type: "BUTTON",
				sub_type: "flow",
				index: "0",
				parameters: [{ type: "action", action: { flow_token: flowToken } }],
			},
		];

		language = "es";

		return { components, language };
	} else {
		flowToken = 0;
		console.log("Cannot find template in searchFlowStructure.js");
		return;
	}
};
