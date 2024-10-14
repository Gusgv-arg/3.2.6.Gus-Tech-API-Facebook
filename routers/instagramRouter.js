import express from "express";
import { getInstagramWebhookController } from "../controllers/getInstagramwebhookController.js";
import { postInstagramWebhookController } from "../controllers/postInstagramWebhookController.js";


const instagramRouter = express.Router();

instagramRouter.get("/", getInstagramWebhookController);
instagramRouter.post(
	"/",
	//messengerGeneralBotSwitchMiddleware,
	//userMessengerMiddleware,
	postInstagramWebhookController
);

export default instagramRouter;