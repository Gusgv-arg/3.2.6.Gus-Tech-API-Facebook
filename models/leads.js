import mongoose from "mongoose";

const leadsSchema = new mongoose.Schema(
	{
		id_user: { type: String, required: true },
		content: { type: String, required: true },
		thread_id: { type: String, required: true },
		name: { type: String },
		channel: { type: String },
	},
	{
		timestamps: true,
	}
);

const Leads = mongoose.model("Leads", leadsSchema);
export default Leads;
