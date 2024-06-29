import express from "express";
import { getWhatsappWebhookController } from "../controllers/getWhatsappWebhookController.js";

const whatsappRouter = express.Router()

whatsappRouter.get("/", getWhatsappWebhookController);
//whatsappRouter.post("/", postWhatsappWebhookController);


export default whatsappRouter;