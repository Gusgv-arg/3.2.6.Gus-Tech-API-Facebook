import Leads from "../models/leads.js";
import axios from "axios";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";

export const saveVendorFlow_2Response = async (senderId, notification) => {
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
		// Looks existent lead
		let lead = await Leads.findOne({ id_user: senderId });
		console.log("Notification en saveVendorFlow_2Response:", notification)
		
		// Update existing lead
		if (notification === "Respuesta del Vendedor: Atender") {
			lead.flows[lead.flows.length - 1].client_status = "vendedor";
			lead.flows[
				lead.flows.length - 1
			].history += `${currentDateTime} - Status Cliente: Vendedor `;
		
        } else if (notification === "Respuesta del Vendedor: No Atender") {
			lead.flows[lead.flows.length - 1].client_status = "respuesta";
			lead.flows[
				lead.flows.length - 1
			].history += `${currentDateTime} - Status Cliente: Respuesta`;
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
