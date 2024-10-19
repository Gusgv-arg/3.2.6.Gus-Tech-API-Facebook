import Leads from "../models/leads.js";

export const checkInstagramMidMiddleware = async (req, res, next) => {
	const senderId = req.body?.entry?.[0]?.messaging?.[0]?.sender?.id || "";
	const instagramMessageId =
		req.body?.entry?.[0]?.messaging?.[0]?.message?.mid || "";

	if (senderId && instagramMessageId) {
		try {
			const lead = await Leads.findOne({ id_user: senderId });
			if (lead) {
				// Envolver la operación includes en una promesa
				const isDuplicate = await new Promise((resolve) => {
					setImmediate(() => {
						resolve(lead.instagramMid.includes(instagramMessageId));
					});
				});

				if (isDuplicate) {
					console.log("Mensaje duplicado detectado. Ignorando.");
					res.status(200).send("EVENT_RECEIVED");
				}
			}
		} catch (error) {
			console.error("Error en userInstagramMiddleware:", error);
			res.status(500).send("Internal Server Error");
		}
	} else {
        console.log("Algo está mal xq no hay senderId o Mid")
    }
	next(); // Continuar al siguiente middleware si no hay duplicados
};
