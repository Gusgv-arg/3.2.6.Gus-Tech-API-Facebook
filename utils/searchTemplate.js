import dotenv from "dotenv";
import axios from "axios";
import { adminWhatsAppNotification } from "./adminWhatsAppNotification.js";

const whatsappBusinessId = process.env.WHATSAPP_BUSINESS_ID;
const whatsappToken = process.env.WHATSAPP_TOKEN;
//const whatsappToken="EAANyjgoo5J4BO0dTv8kduiyVohevetzbkX64aRraJBLXi5WXNwAZBuJKfEZAkgwr1W4D2jifACtimx4Cpl4NZCgufglHbwHBwV9m2jfcZCdwxJr4RVC6oufflop3JqaWFz4BtGtcpdZCmHxxtquYiWjZBbSRXSqm3tdlY7UkCUvg3wAFDPefs0rC8E6a3GzZBbtIQZDZD"
console.log("token", whatsappToken);
console.log("whatsapp business ID", whatsappBusinessId);

//Function that searches WhatsApp body Template
export const searchTemplate = async (templateName) => {
	try {
		// Get WhatsApp Templates from Facebook
		const urlTemplates = `https://graph.facebook.com/v20.0/${whatsappBusinessId}/message_templates?fields=name,status`;
		//const urlTemplates = `https://graph.facebook.com/v20.0/368815972981027/message_templates?fields=name,status`;
		//const urlTemplates = `https://graph.facebook.com/v20.0/368815972981027/message_templates?fields=name,status?access_token=${process.env.WHATSAPP_TOKEN}`;

		const response = await axios.get(urlTemplates, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${whatsappToken}`,
			},
		});
		console.log("response de templates:", response.data);

		// Filter needed Template to get the Template ID
		const allTemplates = response.data.data;
		const desiredTemplate = allTemplates.find(
			(template) => template.name === templateName
		);

		if (!desiredTemplate) {
			throw new Error(`Template with name "${templateName}" not found`);
		}

		const templateId = desiredTemplate.id;
		console.log("Template ID", templateId)

		// With Template ID get the body
		const urlTemplateBody = `https://graph.facebook.com/v20.0/${templateId}`;

		const response2 = axios.get(urlTemplateBody, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${whatsappToken}`,
			},
		});

		const templateData = response2.data;
		console.log("Templatedata:", templateData)
		
		const bodyComponent = templateData.components.find(
			(component) => component.type === "BODY"
		);

		if (!bodyComponent) {
			throw new Error("Body component not found in the template");
		}

		const templateContent = bodyComponent.text;

		return templateContent;
	} catch (error) {
		console.log("Error en searchTemplate.js", error.message);
		await adminWhatsAppNotification(
			`*NOTIFICACION de Error de Campaña:*\n${error.message} en searchTemplate.js`
		);
	}
};
//searchTemplate("campania_whatsapp");
