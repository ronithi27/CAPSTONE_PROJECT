import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    from_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    to_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        default: ""
    },
    message_type: {
        type: String,
        enum: ["text", "image"],
        default: "text"
    },
    media_url: {
        type: String,
        default: ""
    },
    seen: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for fetching conversations
messageSchema.index({ from_user: 1, to_user: 1, createdAt: -1 });
messageSchema.index({ to_user: 1, from_user: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
