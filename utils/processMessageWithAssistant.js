import OpenAI from "openai";
import dotenv from "dotenv";
import Leads from "../models/leads.js";
import { saveMessageInDb } from "./saveMessageInDb.js";

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: API_KEY,
});

export const processMessageWithAssistant = async (sender_psid, userMessage) => {
	const assistantId = process.env.OPENAI_ASSISTANT_ID;
	let threadId;

	// Check if there is an existing thread for the user
	let existingThread;
	try {
		existingThread = await Leads.findOne({
			id_user: sender_psid,
			thread_id: { $exists: true },
		});
	} catch (error) {
		console.error("Error fetching thread from the database:", error);
		throw error;
	}

	if (existingThread) {
		threadId = existingThread.thread_id;
		
		// Pass in the user question into the existing thread
		await openai.beta.threads.messages.create(threadId, {
			role: "user",
			content: userMessage,
		});
	} else {
		// Create a new thread
		const thread = await openai.beta.threads.create();
		threadId = thread.id;
		
		// Pass in the user question into the new thread
		await openai.beta.threads.messages.create(threadId, {
			role: "user",
			content: userMessage,
		});
	}

	// Run the assistant and wait for completion
	let maxAttempts = 5;
	let currentAttempt = 0;
	let runStatus;
	let run;
	do {
		try {
			run = await openai.beta.threads.runs.create(threadId, {
				assistant_id: assistantId,
			});

			runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

			while (runStatus.status !== "completed") {
				await new Promise((resolve) => setTimeout(resolve, 2000));
				runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
			}

			console.log(
				"Run status is completed. Proceeding with sending the message to the user."
			);

			break; // Exit the loop if the run is completed
		} catch (error) {
			console.error("Error running the assistant:", error.message);
			currentAttempt++;
			if (currentAttempt >= maxAttempts) {
				console.error("Exceeded maximum attempts. Exiting the loop.");
				break; // Exit the loop if maximum attempts are exceeded
			}
		}
	} while (currentAttempt < maxAttempts);

	// Get the last assistant message from the messages array
	const messages = await openai.beta.threads.messages.list(threadId);

	// Find the last message for the current run
	const lastMessageForRun = messages.data
		.filter(
			(message) => message.run_id === run.id && message.role === "assistant"
		)
		.pop();

	// Save the received message from the user and send the assistants response
	if (userMessage && lastMessageForRun) {
		let messageGpt = lastMessageForRun.content[0].text.value;

		// Save the received message to the database		
		await saveMessageInDb(
			sender_psid,
			userMessage,
			threadId
		);
		return { messageGpt, sender_psid, threadId };
	}
};
