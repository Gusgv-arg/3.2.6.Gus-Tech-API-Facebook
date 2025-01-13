import Leads from "../models/leads.js";
import axios from "axios";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";

export const saveVendorFlow_2Response = async (
	senderId,
	notification,
	flowToken,
	name
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
		let lead = await Leads.findOne({ "flows.flow_token": flowToken });
		
		// Check if lead and flows exist
		if (!lead || !lead.flows || lead.flows.length === 0) {
			console.log("No se encontró el lead o no tiene flujos.");
			return null; 
		}
		console.log("FlowToken recibido en saveVendroFlow_2", flowToken)
		
		// Find the specific flow to update
		const flowToUpdate = lead.flows.find(
			(flow) => flow.flow_token === flowToken
		);

		if (flowToUpdate) {
			// Update existing lead
			if (notification.includes("Respuesta del Vendedor: Atender")) {
				flowToUpdate.client_status = "vendedor";
				flowToUpdate.vendor_phone = senderId;
				flowToUpdate.vendor_name = name;
				flowToUpdate.history += `${currentDateTime} - Status Cliente: Vendedor ${name} `;
				console.log(
					`El vendedor ${name} aceptó atender al cliente ${lead.name}`
				);
			} else if (notification.includes("Respuesta del Vendedor: No Atender")) {
				flowToUpdate.client_status = "respuesta";
				flowToUpdate.vendor_phone = null;
				flowToUpdate.vendor_name = null;
				flowToUpdate.history += `${currentDateTime} - Status Cliente: Respuesta`;
				console.log(
					`El vendedor ${name} NO aceptó atender al cliente ${lead.name}!!`
				);
			} else {
				console.log(
					"NO SE ESTA GRABANDO NADA en saveVendorFlow_2Response.js!!"
				);
			}
		} else {
			console.log("NO SE ESTA GRABANDO NADA en saveVendorFlow_2Response.js!!");
		}

		await lead.save();
		
		const customerName = lead.name
		const customerPhone = lead.id_user
		const vendorPhone = flowToUpdate.vendor_phone
		const vendorName = flowToUpdate.vendor_name
		
		return {customerName, customerPhone, vendorPhone, vendorName};

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
