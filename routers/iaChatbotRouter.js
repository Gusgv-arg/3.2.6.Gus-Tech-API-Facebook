import express from "express";
import { getFacebookWebhookController } from "../controllers/getFacebookWebhookController.js";
import { postFacebookWebhookController } from "../controllers/postFacebookWebhookController.js";


const iaChatbotRouter = express.Router();

iaChatbotRouter.get("/", getFacebookWebhookController);
iaChatbotRouter.post("/", postFacebookWebhookController);

export default iaChatbotRouter;
