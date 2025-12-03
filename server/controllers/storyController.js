import Story from "../models/Story.js";
import User from "../models/User.js";
import { uploadToCloudinary } from "../configs/cloudinary.js";

// Create a new story
export const createStory = async (req, res) => {
    try {
        const { content, background_color, media_type } = req.body;
        
        let media_url = "";
        let storyMediaType = media_type || "text";

        // Upload media if provided
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'pingup/stories');
            media_url = result.secure_url;
            
            // Detect media type from file
            if (req.file.mimetype.startsWith('video/')) {
                storyMediaType = "video";
            } else if (req.file.mimetype.startsWith('image/')) {
                storyMediaType = "image";
            }
        }

        // Validate: must have content or media
        if (!content && !media_url) {
            return res.status(400).json({
                success: false,
                message: "Story must have content or media"
            });
        }

        const story = await Story.create({
            user: req.user._id,
            content: content || "",
            media_url,
            media_type: storyMediaType,
            background_color: background_color || "#4f46e5"
        });

        await story.populate('user', 'username full_name profile_picture');

        res.status(201).json({
            success: true,
            message: "Story created successfully",
            story
        });
    } catch (error) {
        console.error("Create story error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get stories from followed users
export const getStories = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        
        // Get stories from followed users + own stories
        const storyUsers = [...(currentUser.following || []), req.user._id];

        // Get all stories (flat list)
        const stories = await Story.find({
            user: { $in: storyUsers },
            expiresAt: { $gt: new Date() }
        })
        .populate('user', 'username full_name profile_picture')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            stories
        });
    } catch (error) {
        console.error("Get stories error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user's stories
export const getUserStories = async (req, res) => {
    try {
        const { userId } = req.params;

        const stories = await Story.find({
            user: userId,
            expiresAt: { $gt: new Date() }
        })
        .populate('user', 'username full_name profile_picture')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            stories
        });
    } catch (error) {
        console.error("Get user stories error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// View a story
export const viewStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.user._id;

        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({
                success: false,
                message: "Story not found"
            });
        }

        // Check if already viewed
        const alreadyViewed = story.views.some(
            view => view.user.toString() === userId.toString()
        );

        if (!alreadyViewed) {
            story.views.push({ user: userId });
            await story.save();
        }

        res.status(200).json({
            success: true,
            message: "Story viewed",
            views_count: story.views.length
        });
    } catch (error) {
        console.error("View story error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete story
export const deleteStory = async (req, res) => {
    try {
        const { storyId } = req.params;

        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({
                success: false,
                message: "Story not found"
            });
        }

        // Check if user owns the story
        if (story.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this story"
            });
        }

        await Story.findByIdAndDelete(storyId);

        res.status(200).json({
            success: true,
            message: "Story deleted successfully"
        });
    } catch (error) {
        console.error("Delete story error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get story viewers
export const getStoryViewers = async (req, res) => {
    try {
        const { storyId } = req.params;

        const story = await Story.findById(storyId)
            .populate('views.user', 'username full_name profile_picture');

        if (!story) {
            return res.status(404).json({
                success: false,
                message: "Story not found"
            });
        }

        // Only story owner can see viewers
        if (story.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view story viewers"
            });
        }

        res.status(200).json({
            success: true,
            viewers: story.views,
            views_count: story.views.length
        });
    } catch (error) {
        console.error("Get story viewers error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
