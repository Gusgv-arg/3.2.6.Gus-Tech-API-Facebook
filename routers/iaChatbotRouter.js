import express from "express";
import { getWebhookController } from "../controllers/getWebhookController.js";
import { postWebhookController } from "../controllers/postWebhookController.js";



const iaChatbotRouter = express.Router();

iaChatbotRouter.get("/", getWebhookController);
iaChatbotRouter.post("/", postWebhookController);

export default iaChatbotRouter;
