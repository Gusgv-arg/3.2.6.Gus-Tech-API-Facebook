import Leads from "../models/leads.js";

export const checkInstagramMidMiddleware = async (req, res, next) => {
    const senderId = req.body?.entry?.[0]?.messaging?.[0]?.sender?.id || "";
    const instagramMessageId = req.body?.entry?.[0]?.messaging?.[0]?.message?.mid || "";

    if (senderId && instagramMessageId) {
        const lead = await Leads.findOne({ id_user: senderId });

        if (lead && lead.instagramMid.includes(instagramMessageId)) {
            console.log("El ID de Instagram ya existe en el array.");
            return res.status(200).send("EVENT_RECEIVED"); // Detener el procesamiento si el ID ya existe
        }
    }
    next(); // Continuar al siguiente middleware si no hay duplicados
};