import dotenv from "dotenv";
import axios from "axios";
import xlsx from 'xlsx';
import { adminWhatsAppNotification } from "../utils/adminWhatsAppNotification.js";

dotenv.config();

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

export const processCampaignExcel = async (excelBuffer) => {
    try {
        // Read the Excel file from the buffer
        const workbook = xlsx.read(excelBuffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

        let successCount = 0;
        let errorCount = 0;

        for (const row of data) {
            const { telefono, nombre, montoCredito } = row;

            if (!telefono || !nombre || montoCredito === undefined) {
                console.error(`Fila inválida: ${JSON.stringify(row)}`);
                errorCount++;
                continue;
            }

            const messageData = {
                messaging_product: "whatsapp",
                to: telefono.toString(),
                type: "template",
                template: {
                    name: "campania_whatsapp",
                    language: {
                        code: "es_AR",
                    },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                { type: "text", text: nombre.toString() },
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