import OpenAI from "openai";
import dotenv from "dotenv";
import Leads from "../models/leads.js";
import { getStockPrice } from "../functions/getStockPrice.js";
import {
	errorMessage1,
	errorMessage2,
	errorMessage3,
	errorMessage5,
} from "./errorMessages.js";
import { cleanThread } from "./cleanThread.js";
import { noPromotions } from "./notificationMessages.js";
import { extractFlowResponses } from "../flows/extractFlowResponses.js";

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: API_KEY,
});

export const processWhatsAppWithAssistant = async (
	senderId,
	userMessage,
	imageURL,
	type,
	userName
) => {
	let assistantId;
	let threadId;
	let campaignFlag = false;
	let flowFlag = false;
	//console.log("sender_psid:", senderId, "userMessage:", userMessage);
	//console.log("Image URL recibida en processmessageWith..:", imageURL)

	let existingThread;
	try {
		// Check if there is an existing thread for the user (general, campaign or flow)
		existingThread = await Leads.findOne({
			id_user: senderId,
			$or: [
				{ thread_id: { $exists: true, $ne: "", $ne: null } },
				{ campaigns: { $exists: true, $ne: [] } },
				{ flows: { $exists: true, $ne: [] } },
			],
		});
	} catch (error) {
		console.error("Error fetching thread from the database:", error);
		throw error;
	}

	// Pass in the user question into the existing thread
	if (existingThread) {
		// Determine if it's General or Campaign or Flow thread
		let generalThreadId = existingThread.thread_id;
		let campaigns = existingThread.campaigns || [];
		let flows = existingThread.flows || [];
		//console.log("General thread Id:", generalThreadId)

		// Filtrar campañas y flujos activos
		let activeCampaigns = campaigns.filter(
			(campaign) => campaign.campaign_status === "activa"
		);
		let activeFlows = flows.filter((flow) => flow.flow_status === "activa");

		if (activeCampaigns.length > 0 || activeFlows.length > 0) {
			// Tomar el último registro activo de campañas o flujos
			let lastActiveCampaign = activeCampaigns[activeCampaigns.length - 1];
			let lastActiveFlow = activeFlows[activeFlows.length - 1];

			if (lastActiveCampaign && lastActiveFlow) {
				// Comparar las fechas de la última campaña y el último flujo
				if (
					new Date(lastActiveCampaign.campaignDate) >=
					new Date(lastActiveFlow.flowDate)
				) {
					threadId = lastActiveCampaign.campaignThreadId;
					assistantId = process.env.OPENAI_CAMPAIGN_ID;
					campaignFlag = true;
				} else {
					threadId = lastActiveFlow.flowThreadId;
					assistantId = process.env.OPENAI_FLOW_ID;
					flowFlag = true;
				}
			} else if (lastActiveCampaign) {
				threadId = lastActiveCampaign.campaignThreadId;
				assistantId = process.env.OPENAI_CAMPAIGN_ID;
				campaignFlag = true;
			} else if (lastActiveFlow) {
				threadId = lastActiveFlow.flowThreadId;
				assistantId = process.env.OPENAI_FLOW_ID;
				flowFlag = true;
			}
		} else if (generalThreadId) {
			// Solo existe el hilo general
			threadId = generalThreadId;
			assistantId = process.env.OPENAI_ASSISTANT_ID;
		} else {
			// No valid threadId found
			console.error("No valid threadId found for user:", senderId);
		}

		console.log("ThreadID utilizado:", threadId);

		//View messages in thread
		/* const thread_messages = await openai.beta.threads.messages.list(threadId)
		thread_messages.data.forEach(message => {
			console.log("Content del mensaje:", message.content);
		}); */

		// If type is Document or Button return a specific message
		if (type === "document") {
			const errorMessage = errorMessage5;
			return { errorMessage, threadId, campaignFlag, flowFlag };
		
		} else if (
			type === "button" &&
			userMessage.toLowerCase() === "detener promociones"
		) {
			const notification = noPromotions;
			return { notification, threadId, campaignFlag, flowFlag };
		
		} else if (type === "interactive") {
			flowFlag = true;
			// Function that identifies Flow with the TOKEN and extracts information
			const responses = extractFlowResponses(userMessage, userName);
			const { finalNotification, flowToken } = responses;
			const notification = finalNotification;
			
			return { notification, threadId, campaignFlag, flowFlag, flowToken };
		}

		if (imageURL) {
			await openai.beta.threads.messages.create(threadId, {
				role: "user",
				content: [
					{
						type: "text",
						text: userMessage
							? userMessage
							: "Dime que ves en esta imágen y 3 ejemplos de como podría aplicar tu capacidad para ver imagenes en un negocio cualquiera.",
					},
					{
						type: "image_url",
						image_url: {
							url: imageURL,
							detail: "high",
						},
					},
				],
			});
		} else {
			await openai.beta.threads.messages.create(threadId, {
				role: "user",
				content: userMessage,
			});
		}
	} else {
		// ----- IN THEORY THIS SHOULD NEVER HAPPEN BECAUSE THE RECORD IS CREATED WITH A THREAD ---- //
		// Create a new thread
		const thread = await openai.beta.threads.create();
		threadId = thread.id;

		// If type is Document or Button return a specific message
		if (type === "document") {
			const errorMessage = errorMessage5;
			return { errorMessage, threadId, campaignFlag, flowFlag };
		} else if (
			type === "button" &&
			userMessage.toLowerCase() === "detener promociones"
		) {
			const notification = noPromotions;
			return { notification, threadId, campaignFlag, flowFlag };
		}

		if (imageURL) {
			await openai.beta.threads.messages.create(threadId, {
				role: "user",
				content: [
					{
						type: "text",
						text: userMessage
							? userMessage
							: "Dime que ves en esta imágen y 3 ejemplos de como podría aplicar tu capacidad para ver imagenes en un negocio cualquiera.",
					},
					{
						type: "image_url",
						image_url: {
							url: imageURL,
							detail: "high",
						},
					},
				],
			});
		} else {
			// Pass in the user question into the new thread
			await openai.beta.threads.messages.create(threadId, {
				role: "user",
				content: userMessage,
			});
		}
	}
	//console.log("threadId:", threadId);

	//******************************METODO ORIGINAL MAS ACCIONES**************************************/
	// Run the assistant and wait for completion
	let maxAttempts = 5;
	let currentAttempt = 0;
	let runStatus;
	let run;
	let errorMessage;
	do {
		try {
			run = await openai.beta.threads.runs.create(threadId, {
				assistant_id: assistantId,
			});

			runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

			while (runStatus.status !== "completed") {
				console.log("run status---->", runStatus.status);
				console.log("run last_error---->", runStatus.last_error);

				if (runStatus.status === "requires_action") {
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
				} else if (runStatus.status === "failed") {
					currentAttempt++;
					const runMessages = await openai.beta.threads.messages.list(threadId);
					if (
						runMessages.body.data[0].assistant_id === null ||
						runStatus.last_error !== null
					) {
						// Error if rate limit is exceeded
						if (runStatus.last_error === "rate_limit_exceeded") {
							errorMessage = errorMessage3;
						} else {
							errorMessage = errorMessage2;
						}

						// Clean threadId for the user due to Openai bug
						await cleanThread(senderId);

						// Return error message to the user
						return { errorMessage, senderId, campaignFlag, flowFlag };
					} else {
						errorMessage = errorMessage1;
					}
				} else {
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
				errorMessage = errorMessage1;

				return { errorMessage, threadId, campaignFlag, flowFlag };
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
	if (lastMessageForRun) {
		let messageGpt = lastMessageForRun.content[0].text.value;
		console.log("MessagGpt-->", messageGpt);
		return { messageGpt, senderId, threadId, campaignFlag, flowFlag };
	}
};
