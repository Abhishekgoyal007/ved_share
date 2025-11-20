import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        questions: [
            {
                question: {
                    type: String,
                    required: true,
                },
                answer: {
                    type: String, // Optional: In case we want to generate answers later
                },
            },
        ],
    },
    { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
