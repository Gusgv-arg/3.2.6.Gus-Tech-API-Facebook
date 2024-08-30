import mongoose from "mongoose";

const messageCampaignSchema = new mongoose.Schema({
	messages: String,
	status: { type: String, enum: ["contactado", "respuesta", "error"] },
	sentAt: Date,
	error: String,
	retryCount: { type: Number, default: 0 },
});

const campaignDetailSchema = new mongoose.Schema({
	campaignName: String,
	campaignDate: Date,
	campaignThreadId: String,
	messages: [messageCampaignSchema],
});

const leadsSchema = new mongoose.Schema(
	{
		name: { type: String },
		id_user: { type: String, required: true },
		channel: { type: String },
		content: { type: String, required: true },
		thread_id: { type: String },
		botSwitch: { type: String, enum: ["ON", "OFF"], required: true },
		responses: { type: Number, required: true },
		campaigns: [campaignDetailSchema],
	},
	{
		timestamps: true,
	}
);

const Leads = mongoose.model("Leads", leadsSchema);
export default Leads;
