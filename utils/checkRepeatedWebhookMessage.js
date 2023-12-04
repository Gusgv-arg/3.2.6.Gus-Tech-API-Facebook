import Messages from "../models/messages.js";
import Webhook_Repeated_Messages from "../models/webhook_repeated_messages.js";

// Function to check and save repeted messages sent by the webhook
export const checkRepeatedWebhookMessage = async (data) => {
    // Check if the message has already been processed
    const existingIdMessage = await Messages.findOne({
        id_user: data.message.from,
        id_message: data.message.id,
    });

    // Save the duplicated message sent by the webhook
    if (existingIdMessage) {
        const name = data.message.visitor && data.message.visitor.name ? data.message.visitor.name : "";
        await Webhook_Repeated_Messages.create({
            name: name,
            id_user: data.message.from,
            content: data.message.contents[0].text,
            id_message: data.message.id,
            channel: data.message.channel,
        });
    }
    return existingIdMessage;
};