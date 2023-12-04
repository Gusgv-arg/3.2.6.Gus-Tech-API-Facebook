import dotenv from "dotenv";
import Messages from "../models/messages.js";
import { saveMessageInDb } from "./saveMessageInDb.js";

dotenv.config();

export const processMessageWithAssistant = async (data, openai) => {
	const assistantId = process.env.OPENAI_ASSISTANT_ID;
	const senderId = data.message.from;
	const receivedMessage = data.message.contents[0].text;
	const messageId = data.message.id;
	const name = data.message.visitor.name;
	const channel = data.message.channel;
	let threadId;

	// Check if there is an existing thread for the user
	let existingThread;
	try {
		existingThread = await Messages.findOne({
			id_user: senderId,
			thread_id: { $exists: true },
		});
	} catch (error) {
		console.error("Error fetching thread from the database:", error);
		throw error;
	}

	if (existingThread) {
		threadId = existingThread.thread_id;
	} else {
		// Create a new thread
		const thread = await openai.beta.threads.create();
		threadId = thread.id;
		console.log("New thread created:", thread);
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
				"Run status is completed. Proceeding with sending the message to Zenvia."
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

	// Send the assistants response
	if (receivedMessage && lastMessageForRun) {
		
		let messageGpt = lastMessageForRun.content[0].text.value;
		
		// If the user is not ME, send another message. Modify this in PRODUCTION!!!!!!!!!!!
		if (senderId != 6874624262580365){
			messageGpt =
			"!Hola! Estamos trabajando para que en los próximos días los mensajes sean respondidos por nuestro Asistente de IA y te ayudemos a responder tus consultas más rápido. En breve te contestamos. !Gracias por esperar! ";
		}

		// Save the received message to the database
		const role = "user";
		await saveMessageInDb(
			name,
			senderId,
			role,
			receivedMessage,
			messageId,
			channel,
			threadId
		);
		return { messageGpt, threadId };
	} 
};
