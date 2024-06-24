import express from "express";
import { getFacebookWebhookController } from "../controllers/getFacebookWebhookController.js";
import { postFacebookWebhookController } from "../controllers/postFacebookWebhookController.js";
import { postFacebookWebhookController2 } from "../controllers/postFacebookWebhookController2.js";


const iaChatbotRouter = express.Router();

iaChatbotRouter.get("/", getFacebookWebhookController);
//iaChatbotRouter.post("/", postFacebookWebhookController);
iaChatbotRouter.post("/", postFacebookWebhookController2);

export default iaChatbotRouter;
