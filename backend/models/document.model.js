import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
	{
		filename: {
			type: String,
			required: true,
		},
		originalName: {
			type: String,
			required: true,
		},
		fileType: {
			type: String,
			required: true,
		},
		fileSize: {
			type: Number,
			required: true,
		},
		filePath: {
			type: String,
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		keywords: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Keyword",
		}],
	},
	{
		timestamps: true,
	}
);

const Document = mongoose.model("Document", documentSchema);

export default Document;