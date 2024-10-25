import Leads from "../models/leads.js";

export const checkInstagramMidMiddleware = async (req, res, next) => {
	const senderId = req.body?.entry?.[0]?.messaging?.[0]?.sender?.id || "";
	const instagramMessageId =
		req.body?.entry?.[0]?.messaging?.[0]?.message?.mid || "";
	const read = req.body?.entry?.[0]?.messaging?.[0]?.read
		? req.body.entry[0].messaging[0].read
		: "no read";

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
					return res.status(200).send("EVENT_RECEIVED");
				}
			}
		} catch (error) {
			console.error("Error en userInstagramMiddleware:", error);
			res.status(500).send("Internal Server Error");
		}
	} else if (read !== "no read") {
		console.log("Exiting because a read property entered", read);
		return res.status(200).send("EVENT_RECEIVED");
	}
	next(); // Continuar al siguiente middleware si no hay duplicados
};
