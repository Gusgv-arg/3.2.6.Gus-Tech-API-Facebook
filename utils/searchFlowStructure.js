// Searches Flow structure to return format por post request

export const searchFlowStructure = (templateName, columnB, columnC) => {
	// Generate a flow token && parameters to identify the flow among others
	let flowToken;
	let components;
	let language;

	if (templateName === "flow6") {
		flowToken = 1;
		components: [
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
		],
		language = "es";

		return { components, language };
	} else if (templateName === "pedidos_megamoto") {
		flowToken = 2;

		language = "es_AR";
	} else {
		flowToken = 0;
	}
};
