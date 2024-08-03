import Leads from "./models/Leads.js";

export const cleanThread = async (senderId) => {
	
    try {
		let lead = await Leads.findOne({ id_user: senderId });
		if (lead) {
			lead.thread_id = "";
			await lead.save();
            return
		} else {
            console.log(`El Thread del usuario con ID ${senderId} NO pudo ser reseteado`)
            return
        }
	} catch (error) {
        console.log("Error in cleanThreadController.js:", error.message)
        throw error
    }
};