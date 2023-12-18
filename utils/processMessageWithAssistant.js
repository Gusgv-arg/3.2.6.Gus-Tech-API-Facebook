import OpenAI from "openai";
import dotenv from "dotenv";
import Leads from "../models/leads.js";
import { saveMessageInDb } from "./saveMessageInDb.js";
import { getStockPrice } from "../functions/getStockPrice.js";

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: API_KEY,
});

export const processMessageWithAssistant = async (sender_psid, userMessage) => {
	const assistantId = process.env.OPENAI_ASSISTANT_ID;
	let threadId;
	console.log("sender_psid:", sender_psid, "userMessage:", userMessage)

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

	// Pass in the user question into the existing thread
	if (existingThread) {
		threadId = existingThread.thread_id;

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
console.log("threadId:", threadId)
	//******************************METODO ORIGINAL**************************************/
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
				if (runStatus.status === 'requires_action') {
					console.log("Requires action");
				
					const requiredActions = runStatus.required_action.submit_tool_outputs.tool_calls;
					console.log(requiredActions);
				
					let toolsOutput = [];
				
					for (const action of requiredActions) {
						const funcName = action.function.name;
						const functionArguments = JSON.parse(action.function.arguments);
						
						if (funcName === "getStockPrice") {
							const output = await getStockPrice(functionArguments.symbol);
							toolsOutput.push({
								tool_call_id: action.id,
								output: JSON.stringify(output)  
							});
						} else {
							console.log("Function not found");
						}
					}
				
					// Submit the tool outputs to Assistant API
					await openai.beta.threads.runs.submitToolOutputs(
						threadId,
						run.id,
						{ tool_outputs: toolsOutput }
					);
				} 
				else {
					console.log("Run is not completed yet.");
				}  
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
	//********HASTA ACA METODO ORIGINAL ************************************************************/

	//**************** METODO CON ACCIONES *********************************************************/

	// Creates a run for the thread
	/*let run;
	run = await openai.beta.threads.runs.create(threadId, {
		assistant_id: assistantId,
	});
	
	// Function to check run status
	const checkRunStatus = async (threadId, runId) => {
		console.log("threadId:", threadId);
		console.log("runId:", runId);
		let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
		console.log("runStatus:", runStatus);
		if (runStatus.status === "completed") {
			let messages = await openai.beta.threads.messages.list(threadId);
			messages.data.forEach((msg) => {
				const role = msg.role;
				const content = msg.content[0].text.value;
				console.log(
					`${role.charAt(0).toUpperCase() + role.slice(1)}: ${content}`
				);
			});
			console.log("Run is completed.");
			clearInterval(intervalId);
			
		} else if (runStatus.status === "requires_action") {
			console.log("Requires action");

			const requiredActions =
				runStatus.required_action.submit_tool_outputs.tool_calls;
			console.log(requiredActions);

			let toolsOutput = [];

			for (const action of requiredActions) {
				const funcName = action.function.name;
				const functionArguments = JSON.parse(action.function.arguments);

				if (funcName === "getStockPrice") {
					const output = await getStockPrice(functionArguments.symbol);
					toolsOutput.push({
						tool_call_id: action.id,
						output: JSON.stringify(output),
					});
				} else {
					console.log("Function not found");
				}
			}

			// Submit the tool outputs to Assistant API
			await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
				tool_outputs: toolsOutput,
			});
		} else {
			console.log("Run is not completed yet.");
		}
	};
console.log("x entrar en interval.ThreadId:", threadId, "runId:", run.id)
	const intervalId = setInterval(() => {
		console.log("ejecuto checkRunStatus");
		checkRunStatus(threadId, run.id);
	}, 2000); */
	 
	  
	//***FINAL METODO CON ACCIONES *****************************************************************/

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
		await saveMessageInDb(sender_psid, userMessage, threadId);
		return { messageGpt, sender_psid, threadId };
	}
};
