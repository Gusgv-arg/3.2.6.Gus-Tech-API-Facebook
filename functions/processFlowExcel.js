import axios from "axios";
import xlsx from "xlsx";
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";
import Leads from "../models/leads.js";
import { searchTemplate } from "../utils/searchTemplate.js";
import { createGeneralThread } from "../utils/createGeneralThread.js";
import { createCampaignOrFlowThread } from "../flows/createCampaignOrFlowThread.js";
import { searchFlow_1Structure } from "../flows/searchFlow_1Structure.js";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;
const appToken = process.env.WHATSAPP_APP_TOKEN;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const processFlowExcel = async (excelBuffer, templateName) => {
	
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
		// Look for the template text body
		const templateText = await searchTemplate(templateName);
		console.log("Texto de la Plantilla:", templateText);

		// Extract variables from template text
		const templateVariables = templateText.match(/{{\w+}}/g) || [];
		const templateVariableCount = templateVariables.length;

		// Process Excel file
		const workbook = xlsx.read(excelBuffer, { type: "buffer" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = xlsx.utils.sheet_to_json(sheet);

		// Get headers dynamically
		const headers = Object.keys(data[0]);
		const excelVariableCount = headers.length - 1; // Exclude the phone number column

		// Check if the number of variables match
		if (templateVariableCount !== excelVariableCount) {
			throw new Error(
				`La plantilla de WhatsApp tiene ${templateVariableCount} variables y el Excel tiene ${excelVariableCount} columnas. Deben coincidir la cantidad de variables de la Plantilla de WhatsApp con la cantidad de columnas del Excel a partir de la columna B.`
			);
		}

		// URL where to post
		const url = `https://graph.facebook.com/v21.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

		// Variables to track
		let successCount = 0;
		let errorCount = 0;
		let newLeadsCount = 0;
		let flowThreadId = "";

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

			// Función para escapar caracteres especiales en expresiones regulares
			function escapeRegExp(string) {
				return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			}

			// Asignar los valores de las columnas a los parámetros
			const columnB = row[headers[1]] ? row[headers[1]].toString().trim() : ""; // Columna B
			const columnC = row[headers[2]] ? row[headers[2]].toString().trim() : ""; // Columna C

			// Create personalized message by replacing variables in templateText
			let personalizedMessage = templateText;

			personalizedMessage = templateText.replace(
				/{{(\d+)}}/g,
				(match, number) => {
					switch (number) {
						case "1":
							return columnB;
						case "2":
							return columnC;
						default:
							return match; // Devuelve la variable sin reemplazo si no hay coincidencia
					}
				}
			);

			console.log("Mensaje individual:", personalizedMessage);

			// Search Flow structure for post request
			const flowStructure = searchFlow_1Structure(templateName, columnB, columnC);
			const { components, language } = flowStructure;

			// Payload for sending a template with an integrated flow
			const payload = {
				messaging_product: "whatsapp",
				recipient_type: "individual",
				to: telefono,
				type: "template",
				template: {
					name: templateName,
					language: { code: language },
					components: components,
				},
			};

			//console.log("Data final para el POST:", JSON.stringify(payload, null, 2));

			try {
				// Post to the customer
				const response = await axios.post(url, payload, {
					headers: { "Content-Type": "application/json" },
				});
				console.log(
					`Plantilla enviada a ${telefono}: ${response.data.messages[0].id}`
				);

				// Increment counter
				successCount++;

				// Create a thread with the initial messages
				flowThreadId = await createCampaignOrFlowThread(personalizedMessage);
				//console.log("campaignthreadID-->", campaignThread);

				// Prepare a detailed object
				const detail = {
					flowName: templateName,
					flowDate: currentDateTime,
					flowThreadId: flowThreadId,
					messages: `MegaBot: ${personalizedMessage}`,
					client_status: "contactado",
					flow_status: "activa",
					history: `${currentDateTime}: Primer contacto. `,
					error: "",
				};

				// Looks existent lead or creates a new one
				let lead = await Leads.findOne({ id_user: telefono.toString() });

				if (!lead) {
					// Create a General Thread (just in case the campaign is stopped)
					const generalThread = await createGeneralThread();

					// Creates a new lead if it does not exist
					lead = new Leads({
						name: row[headers[1]] || "", // Asumiendo que el nombre está en la segunda columna
						id_user: telefono.toString(),
						channel: "WhatsApp",
						content: "",
						thread_id: generalThread,
						botSwitch: "ON",
						responses: 0,
						flows: [detail],
					});
					await lead.save();
					newLeadsCount++;
				} else {
					// Update existing lead with New Flow
					lead.flows.push(detail);
					await lead.save();
				}
			} catch (error) {
				console.error(
					`Error enviando mensaje a ${telefono}:`,
					error.response?.data || error.message
				);
				console.log("error.message:", error.message);
				//console.log("error:", error);
				errorCount++;

				// Handle the Error
				const detail = {
					flowName: templateName,
					flowDate: currentDateTime,
					flowThreadId: flowThreadId,
					messages: `Error al contactar cliente por la Plantilla.`,
					client_status: "error",
					flow_status: "activa",
					history: `${currentDateTime}: Status Ciente: Error -> ${error.message}`,
					error: error?.response?.data
						? JSON.stringify(error.response.data.message)
						: error.message,
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
						$push: { flows: detail },
					},
					{ upsert: true, new: true }
				);

				errorCount++;
				await adminWhatsAppNotification(
					`*NOTIFICACION de Error de Plantilla para ${telefono}-${
						row[headers[1]] || ""
					}:*\n + ${
						error?.response?.data
							? JSON.stringify(error.response.error.message)
							: error.message
					}`
				);
			}

			// Delay for 3 seconds before sending the next message
			await delay(3000);
		}

		const summaryMessage = `*NOTIFICACION de Plantilla:*\nMensajes enviados: ${successCount}\nErrores: ${errorCount}`;
		await adminWhatsAppNotification(summaryMessage);
	} catch (error) {
		console.error(
			"Error in processFlowExcel.js:",
			error?.response?.data
				? JSON.stringify(error.response.data)
				: error.message
		);

		// Receives the throw new error && others
		await adminWhatsAppNotification(
			`*NOTIFICACION de Error de Plantilla:*\n${
				error?.response?.data
					? JSON.stringify(error.response.data)
					: error.message
			}`
		);
	}
};
