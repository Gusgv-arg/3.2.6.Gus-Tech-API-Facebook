import dotenv from "dotenv";
import axios from "axios";
import xlsx from 'xlsx';
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";

dotenv.config();

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const processCampaignExcel = async (excelBuffer, templateName) => {
    try {
        const workbook = xlsx.read(excelBuffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

        let successCount = 0;
        let errorCount = 0;

        // Get headers dynamically
        const headers = Object.keys(data[0]);

        for (const row of data) {
            // Ensure the row has a phone number (assuming it's the first column)
            const telefono = row[headers[0]];
            if (!telefono) {
                console.error(`Fila inválida (sin número de teléfono): ${JSON.stringify(row)}`);
                errorCount++;
                continue;
            }

            // Prepare parameters for the message
            const parameters = headers.slice(1).map(header => ({
                type: "text",
                text: row[header] ? row[header].toString() : ""
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
                            type: "body",
                            parameters: parameters,
                        },
                    ],
                },
            };

            try {
                const response = await axios.post(url, messageData, {
                    headers: { "Content-Type": "application/json" },
                });
                console.log(`Mensaje enviado a ${telefono}: ${response.data.messages[0].id}`);
                successCount++;
            } catch (error) {
                console.error(`Error enviando mensaje a ${telefono}:`, error.response?.data || error.message);
                errorCount++;
            }

            // Delay for 3 seconds before sending the next message
            await delay(3000);
        }

        const summaryMessage = `NOTIFICACION de Campaña procesada:\nMensajes enviados: ${successCount}\nErrores: ${errorCount}`;
        await adminWhatsAppNotification(summaryMessage);

    } catch (error) {
        console.error("Error processing campaign Excel:", error.message);
        await adminWhatsAppNotification("NOTIFICACION de Error al procesar la campaña:\n" + error.message);
    }
};