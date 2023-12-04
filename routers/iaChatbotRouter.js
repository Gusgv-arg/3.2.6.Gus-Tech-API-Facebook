import express from "express";
import { getMessengerWebhookController } from "../controllers/getMessengerWebhookController.js";
import { postMessengerWebhookController } from "../controllers/postMessengerWebhookController.js";



const iaChatbotRouter = express.Router();

iaChatbotRouter.get("/", getMessengerWebhookController);
iaChatbotRouter.post("/", postMessengerWebhookController);

export default iaChatbotRouter;
