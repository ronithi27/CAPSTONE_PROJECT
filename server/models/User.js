import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        default: "",
        maxlength: 500
    },
    profile_picture: {
        type: String,
        default: ""
    },
    cover_photo: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    is_verified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for search
userSchema.index({ username: 'text', full_name: 'text' });

const User = mongoose.model("User", userSchema);

export default User;
