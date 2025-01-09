import Leads from "../models/leads.js";
import axios from "axios";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";

export const saveVendorFlow_2Response = async (
	senderId,
	notification,
	flowToken
) => {
	// Obtain current date and hour
	const currentDateTime = new Date().toLocaleString("es-AR", {
		timeZone: "America/Argentina/Buenos_Aires",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	try {
		// Looks existent with flowToken
		let lead = await Leads.findOne({"flows.flow_token": flowToken});
		
		// Update existing lead
		if (notification.includes("Respuesta del Vendedor: Atender")) {
			lead.flows[0].client_status = "vendedor";
			lead.flows[0].vendor_phone = senderId;
			lead.flows[0].history += `${currentDateTime} - Status Cliente: Vendedor `;
			console.log(`El vendedor ${senderId} aceptó atender al cliente ${lead.name}`)

		} else if (notification.includes("Respuesta del Vendedor: No Atender")) {
			lead.flows[0].client_status = "respuesta";
			lead.flows[0].vendor_phone = null;
			lead.flows[0].history += `${currentDateTime} - Status Cliente: Respuesta`;
			console.log(`El vendedor ${senderId} NO aceptó atender al cliente ${lead.name}!!`)
		
		} else {
			console.log("NO SE ESTA GRABANDO NADA en saveVendorFlow_2Response.js!!");
		}

		await lead.save();
	} catch (error) {
		console.error(
			"Error in saveVendorFlow_2Response.js:",
			error?.response?.data
				? JSON.stringify(error.response.data)
				: error.message
		);

		// Receives the throw new error && others
		await adminWhatsAppNotification(
			`*NOTIFICACION de Error en saveVendorFlow_2Response.js:*\n${
				error?.response?.data
					? JSON.stringify(error.response.data)
					: error.message
			}`
		);
	}
};
