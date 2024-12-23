import mongoose from "mongoose";

const campaignDetailSchema = new mongoose.Schema({
	campaignName: String,
	campaignDate: Date,
	campaignThreadId: String,
	messages: String,
	client_status: { type: String, enum: ["contactado", "respuesta", "error"] },
	campaign_status: { type: String, enum: ["activa", "inactiva"] },
	error: String,
});

const surveyDetailSchema = new mongoose.Schema({
	//surveyName: String,
	surveyDate: Date,
	surveyThreadId: String,
	messages: String,
	client_status: { type: String, enum: ["contactado", "respuesta", "error"] },
	survey_status: { type: String, enum: ["activa", "inactiva"] },
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
		surveys: [surveyDetailSchema],
	},
	{
		timestamps: true,
	}
);

const Leads = mongoose.model("Leads", leadsSchema);
export default Leads;
