import mongoose from "mongoose";

const leadsSchema = new mongoose.Schema(
	{
		name: { type: String },
		id_user: { type: String, required: true },
		channel: { type: String },
		content: { type: String, required: true },
		thread_id: { type: String, required: true },
		botSwitch: { type: String, enum: ['ON', 'OFF'], required: true },		
	},
	{
		timestamps: true,
	}
);

const Leads = mongoose.model("Leads", leadsSchema);
export default Leads;
