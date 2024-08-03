import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./utils/errorHandler.js";
import testingRouter from "./routers/testingRouter.js";
import messengerRouter from "./routers/messengerRouter.js"
import whatsappRouter from "./routers/whatsappRouter.js";

dotenv.config();

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
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

//app.use("/webhook", messengerRouter);
app.use("/webhook", whatsappRouter);
app.use("/testing", testingRouter);

// Middleware de manejo de errores
app.use(errorHandler);

const port = process.env.PORT || 8000

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
