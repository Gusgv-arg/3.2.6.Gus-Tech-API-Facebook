import mongoose from "mongoose";

const campaignDetailSchema = new mongoose.Schema({
	campaignName: String,
	campaignDate: Date,
	campaignThreadId: String,
	messages: String,
	client_status: { type: String, enum: ["contactado", "respuesta", "respuesta incompleta", "error", "transferido al vendedor", "vendedor","compró", "sin definición", "no compró"] },
	vendor_Name: String,
	vendor_Phone: Number,
	campaign_status: { type: String, enum: ["activa", "inactiva"] },
	history: String,
	error: String,
});

const flowDetailSchema = new mongoose.Schema({
	flowName: String,
	flowDate: String,
	flowThreadId: String,
	messages: String,
	client_status: { type: String, enum: ["contactado", "respuesta", "respuesta incompleta", "error","transferido al vendedor", "vendedor", "compró", "sin definición", "no compró"] },
	vendor_name: String,
	vendor_phone: Number,
	flow_token: String,
	flow_status: { type: String, enum: ["activa", "inactiva"] },
	history: String,
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
