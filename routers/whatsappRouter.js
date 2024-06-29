import express from "express";

const whatsappRouter = express.Router()

whatsappRouter.get("/", getWhatsappWebhookController);
whatsappRouter.post("/", postWhatsappWebhookController);


export default whatsappRouter;