import dotenv from "dotenv";
import axios from "axios";
import { adminWhatsAppNotification } from "./adminWhatsAppNotification.js";

const whatsapBusinessId = process.env.WHATSAPP_BUSINESS_ID;

//Function that searches WhatsApp body Template
export const searchTemplate = async (templateName) => {
	try {
		// Get WhatsApp Templates from Facebook
		const urlTemplates = `https://graph.facebook.com/v20.0/${whatsapBusinessId}/message_templates?fields=name,status`;

		const response = await axios.get(urlTemplates, {
			headers: { "Content-Type": "application/json" },
		});
		console.log("response de templates:", response.data)

        // Filter needed Template to get the Template ID
        const allTemplates = response.data.data
		const desiredTemplate = allTemplates.find(template => template.name === templateName);

        if (!desiredTemplate) {
            throw new Error(`Template with name "${templateName}" not found`);
        }

		const templateId = desiredTemplate.id

        // With Template ID get the body
		const urlTemplateBody = `https://graph.facebook.com/v20.0/${templateId}`;

        const response2 = axios.get(urlTemplateBody, {
			headers: { "Content-Type": "application/json" },
		})

		const templateData = response2.data;
        const bodyComponent = templateData.components.find(component => component.type === "BODY");

        if (!bodyComponent) {
            throw new Error("Body component not found in the template");
        }

        const templateContent = bodyComponent.text;

        return templateContent;

	} catch (error) {
		console.log("Error en searchTemplate.js", error.message);
		await adminWhatsAppNotification(`*NOTIFICACION de Error de Campaña:*\n${error.message} en searchTemplate.js`);
	}
};
