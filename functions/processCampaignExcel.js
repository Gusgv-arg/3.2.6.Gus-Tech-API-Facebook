import dotenv from "dotenv";
import axios from "axios";
import xlsx from 'xlsx';
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";

dotenv.config();

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

export const processCampaignExcel = async (documentURL) => {
    try {
        // Download the Excel file
        const response = await axios.get(documentURL, { responseType: 'arraybuffer' });
        const workbook = xlsx.read(response.data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

        let successCount = 0;
        let errorCount = 0;

        for (const row of data) {
            const { telefono, nombre, montoCredito } = row;

            const messageData = {
                messaging_product: "whatsapp",
                to: telefono,
                type: "template",
                template: {
                    name: "lanzamiento_gustech",
                    language: {
                        code: "es_AR",
                    },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                { type: "text", text: nombre },
                                { type: "text", text: montoCredito.toString() },
                            ],
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
        }

        // Send a summary notification to the admin
        const summaryMessage = `Campaña procesada:\nMensajes enviados: ${successCount}\nErrores: ${errorCount}`;
        await adminWhatsAppNotification(summaryMessage);

    } catch (error) {
        console.error("Error processing campaign Excel:", error.message);
        await adminWhatsAppNotification("Error al procesar la campaña: " + error.message);
    }
};