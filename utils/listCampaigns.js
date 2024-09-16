import Leads from "../models/leads.js";
import { adminWhatsAppNotification } from "./adminWhatsAppNotification.js";


async function listCampaigns() {
    const leads = await Leads.find().populate('campaigns'); // Obtener todos los leads y sus campañas
    const summary = {};

    leads.forEach(lead => {
        lead.campaigns.forEach(campaign => {
            const { campaignName, campaignDate, campaign_status, client_status } = campaign;
            if (!summary[campaignName]) {
                summary[campaignName] = {
                    campaign_status,
                    contacted: 0,
                    responded: 0,
                };
            }
            if (client_status === "contactado") {
                summary[campaignName].contacted++;
            } else if (client_status === "respuesta") {
                summary[campaignName].responded++;
            }
        });
    });

    // Formatear el resultado en un string
    let result = "";

    for (const [campaignName, data] of Object.entries(summary)) {
        result += `${data.campaignDate} - ${campaignName}: Status-${data.campaign_status}. Contactados: ${data.contacted}. Respondieron: ${data.responded}.\n`;
    }
    console.log("Result-->",result)
    await adminWhatsAppNotification(`*LISTADO DE CAMPAÑAS*\n${result}`)
    
}
export default listCampaigns