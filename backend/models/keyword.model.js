import mongoose from "mongoose";

const keywordSchema = new mongoose.Schema(
	{
		text: {
			type: String,
			required: true,
		},
		confidence: {
			type: Number,
			default: 0,
		},
		frequency: {
			type: Number,
			default: 1,
		},
		documentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Document",
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Keyword = mongoose.model("Keyword", keywordSchema);

export default Keyword;