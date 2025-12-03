import User from "../models/User.js";
import Post from "../models/Post.js";
import { Webhook } from "svix";
import { uploadToCloudinary } from "../configs/cloudinary.js";

// Clerk Webhook Handler - Sync users from Clerk
export const clerkWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        
        if (!webhookSecret) {
            return res.status(500).json({ 
                success: false, 
                message: "Webhook secret not configured" 
            });
        }

        const payload = req.body;
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        };

        const wh = new Webhook(webhookSecret);
        let evt;

        try {
            evt = wh.verify(JSON.stringify(payload), headers);
        } catch (err) {
            console.error("Webhook verification failed:", err);
            return res.status(400).json({ 
                success: false, 
                message: "Webhook verification failed" 
            });
        }

        const { type, data } = evt;

        switch (type) {
            case "user.created": {
                const userData = {
                    clerkId: data.id,
                    email: data.email_addresses[0]?.email_address,
                    username: data.username || data.email_addresses[0]?.email_address.split('@')[0],
                    full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
                    profile_picture: data.image_url || ""
                };

                await User.create(userData);
                console.log("User created:", userData.username);
                break;
            }

            case "user.updated": {
                const updateData = {
                    email: data.email_addresses[0]?.email_address,
                    username: data.username,
                    full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    profile_picture: data.image_url
                };

                await User.findOneAndUpdate(
                    { clerkId: data.id },
                    updateData,
                    { new: true }
                );
                console.log("User updated:", data.id);
                break;
            }

            case "user.deleted": {
                await User.findOneAndDelete({ clerkId: data.id });
                // Also delete user's posts
                await Post.deleteMany({ user: data.id });
                console.log("User deleted:", data.id);
                break;
            }

            default:
                console.log("Unhandled webhook event:", type);
        }

        res.status(200).json({ success: true, message: "Webhook processed" });
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Sync or create user from Clerk (called on first login)
export const syncUser = async (req, res) => {
    try {
        const clerkId = req.headers['x-clerk-user-id'];
        
        if (!clerkId) {
            return res.status(400).json({ 
                success: false, 
                message: "No user ID provided" 
            });
        }

        const { email, username, full_name, profile_picture } = req.body;

        // Check if user exists
        let user = await User.findOne({ clerkId });

        if (user) {
            // Update existing user
            user = await User.findOneAndUpdate(
                { clerkId },
                { 
                    email: email || user.email,
                    username: username || user.username,
                    full_name: full_name || user.full_name,
                    profile_picture: profile_picture || user.profile_picture
                },
                { new: true }
            );
        } else {
            // Create new user
            user = await User.create({
                clerkId,
                email: email || `user_${clerkId.slice(-6)}@pingup.com`,
                username: username || `user_${clerkId.slice(-8)}`,
                full_name: full_name || 'New User',
                profile_picture: profile_picture || ''
            });
        }

        res.status(200).json({
            success: true,
            message: user ? "User synced" : "User created",
            user
        });
    } catch (error) {
        console.error("Sync user error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get current user profile
export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('followers', 'username full_name profile_picture')
            .populate('following', 'username full_name profile_picture');

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get user profile by ID or username
export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        let user;
        // Check if it's a MongoDB ObjectId or username
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(userId);
        } else {
            user = await User.findOne({ username: userId });
        }

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Get user's posts count
        const postsCount = await Post.countDocuments({ user: user._id });

        res.status(200).json({
            success: true,
            user: {
                ...user.toObject(),
                posts_count: postsCount,
                followers_count: user.followers.length,
                following_count: user.following.length
            }
        });
    } catch (error) {
        console.error("Get user profile error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { username, full_name, bio, location } = req.body;
        const updateData = {};

        if (username) {
            // Check if username is taken
            const existingUser = await User.findOne({ 
                username: username.toLowerCase(),
                _id: { $ne: req.user._id }
            });
            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Username is already taken" 
                });
            }
            updateData.username = username.toLowerCase();
        }

        if (full_name) updateData.full_name = full_name;
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update profile picture
export const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "No image provided" 
            });
        }

        let imageUrl;
        
        // Check if Cloudinary is configured
        if (process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
            const result = await uploadToCloudinary(req.file.buffer, 'pingup/profiles');
            imageUrl = result.secure_url;
        } else {
            // Fallback: Convert to base64 data URL for development
            const base64 = req.file.buffer.toString('base64');
            imageUrl = `data:${req.file.mimetype};base64,${base64}`;
        }
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profile_picture: imageUrl },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Profile picture updated",
            profile_picture: imageUrl,
            user
        });
    } catch (error) {
        console.error("Update profile picture error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update cover photo
export const updateCoverPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "No image provided" 
            });
        }

        let imageUrl;
        
        // Check if Cloudinary is configured
        if (process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
            const result = await uploadToCloudinary(req.file.buffer, 'pingup/covers');
            imageUrl = result.secure_url;
        } else {
            // Fallback: Convert to base64 data URL for development
            const base64 = req.file.buffer.toString('base64');
            imageUrl = `data:${req.file.mimetype};base64,${base64}`;
        }
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { cover_photo: imageUrl },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Cover photo updated",
            cover_photo: imageUrl,
            user
        });
    } catch (error) {
        console.error("Update cover photo error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Search users
export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: "Search query must be at least 2 characters" 
            });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { full_name: { $regex: q, $options: 'i' } }
            ],
            _id: { $ne: req.user._id }
        })
        .select('username full_name profile_picture bio is_verified')
        .limit(20);

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Search users error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get user suggestions (users not following)
export const getUserSuggestions = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        
        const suggestions = await User.find({
            _id: { 
                $ne: req.user._id,
                $nin: currentUser.following || []
            }
        })
        .select('username full_name profile_picture bio is_verified followers location')
        .limit(10);

        // Add followers count
        const usersWithCount = suggestions.map(user => ({
            ...user.toObject(),
            followers_count: user.followers?.length || 0
        }));

        res.status(200).json({
            success: true,
            users: usersWithCount,
            suggestions: usersWithCount
        });
    } catch (error) {
        console.error("Get suggestions error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
