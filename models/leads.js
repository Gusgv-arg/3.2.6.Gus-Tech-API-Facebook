import mongoose from "mongoose";

const campaignDetailSchema = new mongoose.Schema({
	campaignName: String,
	campaignDate: Date,
	campaignThreadId: String,
	messages: String,
	client_status: { type: String, enum: ["contactado", "respuesta", "respuesta incompleta", "error", "vendedor"] },
	campaign_status: { type: String, enum: ["activa", "inactiva"] },
	error: String,
});

const flowDetailSchema = new mongoose.Schema({
	flowName: String,
	flowDate: Date,
	flowThreadId: String,
	messages: String,
	client_status: { type: String, enum: ["contactado", "respuesta", "respuesta incompleta", "error", "vendedor"] },
	flow_status: { type: String, enum: ["activa", "inactiva"] },
	error: String,
});

const leadsSchema = new mongoose.Schema(
	{
		name: { type: String },
		id_user: { type: String, required: true },
		channel: { type: String },
		content: { type: String },
		instagramMid: { type: [String] },
		thread_id: { type: String },
		botSwitch: { type: String, enum: ["ON", "OFF"], required: true },
		responses: { type: Number },
		campaigns: [campaignDetailSchema],
		flows: [flowDetailSchema],
	},
	{
		timestamps: true,
	}
);

const Leads = mongoose.model("Leads", leadsSchema);
export default Leads;
