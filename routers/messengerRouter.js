import express from "express";
import { getMessengerWebhookController } from "../controllers/getMessengerWebhookController.js";
import { postMessengerWebhookController } from "../controllers/postMessengerWebhookController.js";


const messengerRouter = express.Router();

messengerRouter.get("/", getMessengerWebhookController);
messengerRouter.post("/", postMessengerWebhookController);


export default messengerRouter;
