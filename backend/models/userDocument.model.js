import mongoose from "mongoose";

const userDocumentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            enum: ["pdf", "image"],
            required: true,
        },
        mimeType: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        },
        cloudinaryId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const UserDocument = mongoose.model("UserDocument", userDocumentSchema);

export default UserDocument;
