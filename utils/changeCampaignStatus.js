import Leads from "../models/leads.js";

export const changeCampaignStatus = async (campaignStatus, campaignName) => {
	try {
		const users = await Leads.find();

		for (const user of users) {
			const campaign = user.campaigns.find(
				(c) => c.campaignName === campaignName
			);
			if (campaign) {
				campaign.campaign_status =
					campaignStatus === "activar" ? "activa" : "inactiva"; // Cambiar el estado
			}
		}

		await Promise.all(users.map((user) => user.save()));
	} catch (error) {
		console.log("Error en changecampaignStatus.js", error.message);
		throw error;
	}
};
