import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import iaChatbotRouter from "./routers/iaChatbotRouter.js";
import { errorHandler } from "./utils/errorHandler.js";
import testingRouter from "./routers/testingRouter.js";

dotenv.config();

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log("Connected to MegaBot data base");
	})
	.catch((err) => {
		console.log(err.message);
	});

const app = express();

app.use(
	cors({
		origin: ["http://localhost:3000"],
		credentials: true,
	})
);
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

app.use("/webhook", iaChatbotRouter);
app.use("/testing", testingRouter);

// Middleware de manejo de errores
app.use(errorHandler);

const port = process.env.PORT || 80

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
