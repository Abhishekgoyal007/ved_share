import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: String, // YYYY-MM-DD format
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        duration: {
            type: Number, // Duration in minutes
            required: true,
        },
        timestamp: {
            type: Number, // Unix timestamp
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying by user and date
focusSessionSchema.index({ user: 1, date: -1 });
focusSessionSchema.index({ user: 1, timestamp: -1 });

const FocusSession = mongoose.model('FocusSession', focusSessionSchema);

export default FocusSession;
