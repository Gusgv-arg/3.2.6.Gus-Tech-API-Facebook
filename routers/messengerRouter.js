import express from "express";
import { getMessengerWebhookController } from "../controllers/getMessengerWebhookController.js";
import { postMessengerWebhookController } from "../controllers/postMessengerWebhookController.js";
import {userMiddleware } from "../middlewares/userMiddleware.js"

const messengerRouter = express.Router();

messengerRouter.get("/", getMessengerWebhookController);
messengerRouter.post("/", userMiddleware, postMessengerWebhookController);


export default messengerRouter;
