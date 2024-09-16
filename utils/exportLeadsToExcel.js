import path from 'path'; 
import { fileURLToPath } from 'url';
import xlsx from "xlsx";
import Leads from "../models/leads.js";
import { sendLeadsByMail } from '../utils/sendLeadsByMail.js';


export const exportLeadsToExcel = async () => {
	
	try {
		// Obtén todos los leads de la base de datos
		const leads = await Leads.find({});
		
		// Convierte los leads a un formato que xlsx pueda entender
		const leadsForXlsx = leads.map((lead) => {
			const campaignData = lead.campaigns.map(campaign => ({
				campaignName: campaign.campaignName,
				campaignDate: campaign.campaignDate,
				client_status: campaign.client_status,
				campaign_status: campaign.campaign_status,
				messages: campaign.messages,
				error: campaign.error,
			}));

			return {
				name: lead.name,
				channel: lead.channel,
				content: lead.content,
				id_user: lead.id_user,
				createdAt: lead.createdAt,
				...Object.assign({}, ...campaignData), 
			};
		});
		
		const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(leadsForXlsx);
        xlsx.utils.book_append_sheet(wb, ws, "Leads");
        
        // Define un nombre de archivo temporal para el archivo Excel
        const tempFilePath = 'excel/Leads.xlsx';
        xlsx.writeFile(wb, tempFilePath);
        console.log("Leads DB exported to Leads.xlsx");
        
        // Obtiene la ruta completa del archivo temporal
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filePath = path.join(__dirname, '../', tempFilePath);
        
        // Envía el archivo por correo electrónico
        await sendLeadsByMail(filePath);                

	} catch (error) {
		console.error("Error in exportLeadsToExcel.js:", error.message);
		throw error;
	}
};
