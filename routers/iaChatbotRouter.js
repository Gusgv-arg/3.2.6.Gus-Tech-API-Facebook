import express from "express";
import { getWabWebhookController } from "../controllers/getWabWebhookController.js";
import { postWabWebhookController } from "../controllers/postWabWebhookController.js";

const iaChatbotRouter = express.Router();

iaChatbotRouter.get("/", getWabWebhookController);
iaChatbotRouter.post("/", postWabWebhookController);

export default iaChatbotRouter;
