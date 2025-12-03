import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    media_url: {
        type: String,
        default: ""
    },
    media_type: {
        type: String,
        enum: ["text", "image", "video"],
        default: "text"
    },
    background_color: {
        type: String,
        default: "#4f46e5"
    },
    views: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }],
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        expires: 0 // TTL index - auto delete when expired
    }
}, { timestamps: true });

// Index for fetching stories
storySchema.index({ user: 1, createdAt: -1 });

const Story = mongoose.model("Story", storySchema);

export default Story;
