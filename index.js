import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./utils/errorHandler.js";
import testingRouter from "./routers/testingRouter.js";
import messengerRouter from "./routers/messengerRouter.js";
import whatsappRouter from "./routers/whatsappRouter.js";
import BotSwitch from "./models/botSwitch.js";
import createBotSwitchInstance from "./utils/createBotSwitchInstance.js";
import instagramRouter from "./routers/instagramRouter.js";
import path from "path";
import { fileURLToPath } from "url";
import {
	decryptRequest,
	encryptResponse,
	FlowEndpointException,
} from "./wab_encryption/encryption.js";
import { getNextScreen } from "./wab_encryption/flow.js";
import crypto from "crypto";
import { isRequestSignatureValid } from "./wab_encryption/isRequestSignatureValid.js";

dotenv.config();

const { WHATSAPP_PRIVATE_KEY, WHATSAPP_PUBLIC_KEY_PASSWORD } = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log("Connected to GusTech data base");
	})
	.catch((err) => {
		console.log(err.message);
	});

const app = express();

app.use(
	cors({
		origin: ["*", "http://localhost:3000"],
		credentials: true,
	})
);
//app.use(express.json());
app.use(
	express.json({
		// store the raw request body to use it for signature verification
		verify: (req, res, buf, encoding) => {
			req.rawBody = buf?.toString(encoding || "utf8");
			//console.log("raw body:", req.rawBody)
		},
	})
);
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Looking for General Bot Switch
let botSwitchInstance;
try {
	botSwitchInstance = await BotSwitch.findOne();
	if (botSwitchInstance) {
		console.log(`MegaBot is ${botSwitchInstance.generalSwitch}`);
	} else {
		let botSwitch = new BotSwitch({
			generalSwitch: "ON",
		});
		await botSwitch.save();
		console.log(`BotSwitch created and set to ${botSwitch.generalSwitch}`);
	}
} catch (error) {
	console.error("Error initializing bot switch:", error.message);
	console.log("Retrying to create botSwitchInstance...");
	await createBotSwitchInstance();
}

// WHATSAPP endpoint config
app.post("/", async (req, res) => {
	//console.log("req.body:", req.body);
	console.log("Whatsapp private key:", WHATSAPP_PRIVATE_KEY);
	try {
		if (!WHATSAPP_PRIVATE_KEY) {
			console.log("Entró en el if(!WHATSAPP_PRIVATE_KEY)");
			throw new Error(
				'Private key is empty. Please check your env variable "WHATSAPP_PRIVATE_KEY".'
			);
		}

		if (!isRequestSignatureValid(req)) {
			// Return status code 432 if request signature does not match.
			// To learn more about return error codes visit: https://developers.facebook.com/docs/whatsapp/flows/reference/error-codes#endpoint_error_codes
			console.log("Entró en el if (!isReuqestSignatureValid)");
			return res.status(432).send();
		}

		let decryptedRequest = null;
		try {
			decryptedRequest = decryptRequest(
				req.body,
				WHATSAPP_PRIVATE_KEY,
				WHATSAPP_PUBLIC_KEY_PASSWORD
			);
			//console.log("decryptedRequest:", decryptedRequest)
		} catch (err) {
			console.error("Error in try of decryptRequest:", err);
			if (err instanceof FlowEndpointException) {
				return res.status(err.statusCode).send();
			}
			return res.status(500).send();
		}
		const { aesKeyBuffer, initialVectorBuffer, decryptedBody } =
			decryptedRequest;
		console.log("💬 Decrypted Request:", decryptedBody);

		// TODO: Uncomment this block and add your flow token validation logic.
		// If the flow token becomes invalid, return HTTP code 427 to disable the flow and show the message in `error_msg` to the user
		// Refer to the docs for details https://developers.facebook.com/docs/whatsapp/flows/reference/error-codes#endpoint_error_codes

		/* if (!isValidFlowToken(decryptedBody.flow_token)) {
			const error_response = {
				error_msg: `The message is no longer available`,
			};
			return res
				.status(427)
				.send(
					encryptResponse(error_response, aesKeyBuffer, initialVectorBuffer)
				);
		} */

		const screenResponse = await getNextScreen(decryptedBody);
		console.log("👉 Response to Encrypt:", screenResponse);

		res.send(
			encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer)
		);
	} catch (error) {
		console.error("Error en index.js:", error.message);
		console.error("Error en index.js:", error);
		return res.status(500).send({ error: "Internal Server Error" });
	}
});

app.use("/webhook_instagram", instagramRouter);
app.use("/webhook_messenger", messengerRouter);
app.use("/webhook", whatsappRouter);
app.use("/testing", testingRouter);

// Middleware de manejo de errores
app.use(errorHandler);

const port = process.env.PORT || 8000;

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
