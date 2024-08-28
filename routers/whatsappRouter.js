import express from "express";
import { getWhatsappWebhookController } from "../controllers/getWhatsappWebhookController.js";
import { postWhatsappWebhookController } from "../controllers/postWhastsappWebhookController.js";
import { userWhatsAppMiddleware } from "../middlewares/userWhatsAppMiddleware.js";
import { postWhatsAppCampaignController } from "../controllers/postWhatsAppCampaignController.js";
import { adminFunctionsMiddleware } from "../middlewares/adminFunctionsMiddleware.js";
import { checkGeneralBotSwitchMiddleware } from "../middlewares/checkGeneralBotSwitchMiddleware.js";

const whatsappRouter = express.Router();

whatsappRouter.get("/", getWhatsappWebhookController);
whatsappRouter.post(
	"/",
	adminFunctionsMiddleware,
	checkGeneralBotSwitchMiddleware,
	userWhatsAppMiddleware,
	postWhatsappWebhookController
);
whatsappRouter.post("/send", postWhatsAppCampaignController);

export default whatsappRouter;
