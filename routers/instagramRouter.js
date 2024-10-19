import express from "express";
import { getInstagramWebhookController } from "../controllers/getInstagramwebhookController.js";
import { postInstagramWebhookController } from "../controllers/postInstagramWebhookController.js";
import { userInstagramMiddleware } from "../middlewares/userInstagramMiddleware.js";
import { instagramGeneralBotSwitchMiddleware } from "../middlewares/instagramGeneralBotSwitchMiddleware.js";
import { checkInstagramMidMiddleware } from "../middlewares/checkInstagramMidMiddleware.js";

const instagramRouter = express.Router();

instagramRouter.get("/", getInstagramWebhookController);
instagramRouter.post(
	"/",
	instagramGeneralBotSwitchMiddleware,
	checkInstagramMidMiddleware,
	userInstagramMiddleware,
	postInstagramWebhookController
);

export default instagramRouter;
