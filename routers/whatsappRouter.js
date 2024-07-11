import express from "express";
import { getWhatsappWebhookController } from "../controllers/getWhatsappWebhookController.js";
import {postWhatsappWebhookController} from "../controllers/postWhastsappWebhookController.js"
import { userMiddleware } from "../middlewares/userMiddleware.js";

const whatsappRouter = express.Router()

whatsappRouter.get("/", getWhatsappWebhookController);
whatsappRouter.post("/", userMiddleware, postWhatsappWebhookController);


export default whatsappRouter;