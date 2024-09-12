import Leads from "../models/leads.js";
import { adminWhatsAppNotification } from "./adminWhatsAppNotification.js";

export const changeCampaignStatus = async (campaignStatus, campaignName) => {
	try {
		const users = await Leads.find();
		let counter = 0;
		let status = "";

		for (const user of users) {
			const campaign = user.campaigns.find(
				(c) => c.campaignName === campaignName
			);

			if (campaign) {
				if (campaignStatus === "activar") {
					campaign.campaign_status = "activa";
					status = "activa";
					counter++;
				} else if (campaignStatus === "inactivar") {
					campaign.campaign_status = "inactiva";
					status = "inactiva";
					counter++;
				}
			}
		}

		await Promise.all(users.map((user) => user.save()));
		await adminWhatsAppNotification(
			`*NOTIFICACION cambio Status de Campaña:*\nPara la Campaña *${campaignName}* se cambiaron *${counter}* registros de clientes al status de Campaña *${status}*.`
		);
	} catch (error) {
		console.log("Error en changecampaignStatus.js", error.message);
		throw error;
	}
};
