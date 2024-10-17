import express from "express";
import { testingController } from "../controllers/testingController.js";

const testingRouter = express.Router();

testingRouter.get("/", testingController)

export default testingRouter