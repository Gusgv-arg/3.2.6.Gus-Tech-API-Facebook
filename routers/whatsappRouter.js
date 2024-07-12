import express from "express";
import { getWhatsappWebhookController } from "../controllers/getWhatsappWebhookController.js";
import {postWhatsappWebhookController} from "../controllers/postWhastsappWebhookController.js"
import { userMiddleware } from "../middlewares/userMiddleware.js";
import { postWhatsappCampaignController } from "../utils/postWhtsappCampaignController.js";

const whatsappRouter = express.Router()

whatsappRouter.get("/", getWhatsappWebhookController);
whatsappRouter.post("/", userMiddleware, postWhatsappWebhookController);
whatsappRouter.post("/send", postWhatsappCampaignController);


export default whatsappRouter;