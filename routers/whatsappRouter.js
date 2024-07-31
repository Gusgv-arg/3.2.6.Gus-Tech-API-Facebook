import express from "express";
import { getWhatsappWebhookController } from "../controllers/getWhatsappWebhookController.js";
import {postWhatsappWebhookController} from "../controllers/postWhastsappWebhookController.js"
import { postWhatsappCampaignController } from "../utils/postWhtsappCampaignController.js";
import { userWhatsAppMiddleware } from "../middlewares/userWhatsAppMiddleware.js";

const whatsappRouter = express.Router()

whatsappRouter.get("/", getWhatsappWebhookController);
whatsappRouter.post("/", userWhatsAppMiddleware, postWhatsappWebhookController);
whatsappRouter.post("/send", postWhatsappCampaignController);

export default whatsappRouter;