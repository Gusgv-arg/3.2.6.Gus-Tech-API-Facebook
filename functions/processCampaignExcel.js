import dotenv from "dotenv";
import axios from "axios";
import xlsx from "xlsx";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";
import Leads from "../models/leads.js";
import { createCampaignThread } from "../utils/createCampaignThread.js";

dotenv.config();

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const processCampaignExcel = async (
	excelBuffer,
	templateName,
	campaignName
) => {
	try {
		const workbook = xlsx.read(excelBuffer, { type: "buffer" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = xlsx.utils.sheet_to_json(sheet);

		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

		// Variables to track Campaign
		let successCount = 0;
		let errorCount = 0;
		let newLeadsCount = 0;
		let campaignThread = "";

		// Get headers dynamically
		const headers = Object.keys(data[0]);

		// Loop for each record
		for (const row of data) {
			// Ensure the row has a phone number in the first column
			const telefono = row[headers[0]];
			if (!telefono) {
				console.error(
					`Fila inválida (sin número de teléfono): ${JSON.stringify(row)}`
				);
				errorCount++;
				continue;
			}

			// From the array of headers, take off  the telephone and map the records that correspond to the variables of the Campaign Template
			const parameters = headers.slice(1).map((header) => ({
				type: "text",
				text: row[header] ? row[header].toString() : "",
			}));

			const messageData = {
				messaging_product: "whatsapp",
				to: telefono.toString(),
				type: "template",
				template: {
					name: templateName,
					language: {
						code: "es_AR",
					},
					components: [
						{
							type: "header",
							parameters: [
								{
									type: "image",
									image: {
										link: "https://github.com/Gusgv-arg/3.2.6.Gus-Tech-API-Facebook/blob/34944992248264371781beaaf3e3c155713dc70a/assets/Gus%20Tech%20logo%20Whatsapp.jpg?raw=true",
									},
								},
							],
						},
						{
							type: "body",
							parameters: parameters,
						},
					],
				},
			};

			try {
				// Post the Campaign to the customer
				const response = await axios.post(url, messageData, {
					headers: { "Content-Type": "application/json" },
				});

				// Increment counter
				successCount++;
				console.log(
					`Mensaje enviado a ${telefono}: ${response.data.messages[0].id}`
				);
								
				// With the message ID get the details of the template
				const messageId =response.data.messages[0].id
				const urlMessage = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages/${messageId}?access_token=${whatsappToken}`;

				const response2 = await axios.post(url, {
					headers: { "Content-Type": "application/json" },
				});

				const template = response2.data
				console.log("Mensaje de la Plantilla:", template)

				// Create a thread for the Campaign
				campaignThread = await createCampaignThread(
					campaignName,
					row[headers[1]]
				);
				//console.log("campaignthreadID-->", campaignThread);

				// Prepare a Campaign detail object
				const campaignDetail = {
					campaignName: campaignName,
					campaignDate: new Date(),
					campaignThreadId: campaignThread,
					messages: `Cliente contactado por la Campaña ${campaignName}.`,
					status: "contactado",
					error: "",
				};

				// Looks existent lead or creates a new one
				let lead = await Leads.findOne({ id_user: telefono.toString() });

				if (!lead) {
					// Creates a new lead if it does not exist
					lead = new Leads({
						name: row[headers[1]] || "", // Asumiendo que el nombre está en la segunda columna
						id_user: telefono.toString(),
						channel: "WhatsApp",
						content: "",
						thread_id: "",
						botSwitch: "ON",
						responses: 0,
						campaigns: [campaignDetail],
					});
					await lead.save();
					newLeadsCount++;
				} else {
					// Update existing lead with Campaign
					lead.campaigns.push(campaignDetail);
					await lead.save();
				}
			} catch (error) {
				console.error(
					`Error enviando mensaje a ${telefono}:`,
					error.response?.data || error.message
				);
				errorCount++;

				// Handle the Error
				const campaignDetail = {
					campaignName: campaignName,
					campaignDate: new Date(),
					campaignThreadId: campaignThread,
					messages: `Error al contactar cliente por la Campaña ${campaignName}.`,
					status: "error",
					error: error.response?.data || error.message,
				};

				await Leads.findOneAndUpdate(
					{ id_user: telefono.toString() },
					{
						$setOnInsert: {
							name: row[headers[1]] || "",
							channel: "WhatsApp",
							content: "",
							botSwitch: "ON",
							responses: 0,
						},
						$push: { campaigns: campaignDetail },
					},
					{ upsert: true, new: true }
				);

				errorCount++;
			}

			// Delay for 3 seconds before sending the next message
			await delay(3000);
		}

		const summaryMessage = `*NOTIFICACION de Campaña:*\nMensajes enviados: ${successCount}\nErrores: ${errorCount}`;
		await adminWhatsAppNotification(summaryMessage);
	} catch (error) {
		console.error("Error processing campaign Excel:", error.message);
		await adminWhatsAppNotification(
			`*NOTIFICACION de Error de Campaña:*\n" + ${error.message}`
		);
	}
};
