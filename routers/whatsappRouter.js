import express from "express";
import { getWhatsappWebhookController } from "../controllers/getWhatsappWebhookController.js";
import {postWhatsappWebhookController} from "../controllers/postWhastsappWebhookController.js"

const whatsappRouter = express.Router()

whatsappRouter.get("/", getWhatsappWebhookController);
whatsappRouter.post("/", postWhatsappWebhookController);


export default whatsappRouter;