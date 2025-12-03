import Post from "../models/Post.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { uploadMultipleToCloudinary } from "../configs/cloudinary.js";

// Helper function to extract hashtags from content
const extractHashtags = (content) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
};

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content && (!req.files || req.files.length === 0)) {
            return res.status(400).json({
                success: false,
                message: "Post must have content or images"
            });
        }

        let image_urls = [];
        let post_type = "text";

        // Upload images if provided
        if (req.files && req.files.length > 0) {
            const uploadResults = await uploadMultipleToCloudinary(req.files, 'pingup/posts');
            image_urls = uploadResults.map(result => result.secure_url);
            post_type = content ? "text_with_image" : "image";
        }

        // Extract hashtags
        const hashtags = content ? extractHashtags(content) : [];

        const post = await Post.create({
            user: req.user._id,
            content: content || "",
            image_urls,
            post_type,
            hashtags
        });

        // Populate user data
        await post.populate('user', 'username full_name profile_picture is_verified');

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            post
        });
    } catch (error) {
        console.error("Create post error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get feed posts (from followed users + own posts)
export const getFeedPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const currentUser = await User.findById(req.user._id);
        
        // Get posts from followed users and own posts
        const feedUsers = [...currentUser.following, req.user._id];

        const posts = await Post.find({ user: { $in: feedUsers } })
            .populate('user', 'username full_name profile_picture is_verified')
            .populate('comments.user', 'username full_name profile_picture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalPosts = await Post.countDocuments({ user: { $in: feedUsers } });

        res.status(200).json({
            success: true,
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                hasMore: skip + posts.length < totalPosts
            }
        });
    } catch (error) {
        console.error("Get feed posts error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all posts (discover/explore)
export const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate('user', 'username full_name profile_picture is_verified')
            .populate('comments.user', 'username full_name profile_picture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalPosts = await Post.countDocuments();

        res.status(200).json({
            success: true,
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                hasMore: skip + posts.length < totalPosts
            }
        });
    } catch (error) {
        console.error("Get all posts error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single post
export const getPost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId)
            .populate('user', 'username full_name profile_picture is_verified')
            .populate('comments.user', 'username full_name profile_picture')
            .populate('likes', 'username full_name profile_picture');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        res.status(200).json({
            success: true,
            post
        });
    } catch (error) {
        console.error("Get post error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ user: userId })
            .populate('user', 'username full_name profile_picture is_verified')
            .populate('comments.user', 'username full_name profile_picture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalPosts = await Post.countDocuments({ user: userId });

        res.status(200).json({
            success: true,
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                hasMore: skip + posts.length < totalPosts
            }
        });
    } catch (error) {
        console.error("Get user posts error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update post
export const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Check if user owns the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this post"
            });
        }

        // Update content and extract new hashtags
        if (content !== undefined) {
            post.content = content;
            post.hashtags = extractHashtags(content);
            
            // Update post type
            if (post.image_urls.length > 0) {
                post.post_type = content ? "text_with_image" : "image";
            } else {
                post.post_type = "text";
            }
        }

        await post.save();
        await post.populate('user', 'username full_name profile_picture is_verified');

        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            post
        });
    } catch (error) {
        console.error("Update post error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete post
export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Check if user owns the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this post"
            });
        }

        await Post.findByIdAndDelete(postId);

        // Delete related notifications
        await Notification.deleteMany({ post: postId });

        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });
    } catch (error) {
        console.error("Delete post error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Like/Unlike post
export const toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // Unlike
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
            
            // Remove notification
            await Notification.findOneAndDelete({
                user: post.user,
                from_user: userId,
                post: postId,
                type: "like"
            });
        } else {
            // Like
            post.likes.push(userId);
            
            // Create notification (if not own post)
            if (post.user.toString() !== userId.toString()) {
                await Notification.create({
                    user: post.user,
                    from_user: userId,
                    post: postId,
                    type: "like",
                    message: "liked your post"
                });
            }
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: isLiked ? "Post unliked" : "Post liked",
            isLiked: !isLiked,
            likes_count: post.likes.length
        });
    } catch (error) {
        console.error("Toggle like error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add comment
export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;

        if (!text || text.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Comment text is required"
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const comment = {
            user: req.user._id,
            text: text.trim()
        };

        post.comments.push(comment);
        await post.save();

        // Create notification (if not own post)
        if (post.user.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: post.user,
                from_user: req.user._id,
                post: postId,
                type: "comment",
                message: "commented on your post"
            });
        }

        // Populate the new comment's user
        await post.populate('comments.user', 'username full_name profile_picture');

        const newComment = post.comments[post.comments.length - 1];

        res.status(201).json({
            success: true,
            message: "Comment added",
            comment: newComment
        });
    } catch (error) {
        console.error("Add comment error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete comment
export const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const comment = post.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Check if user owns the comment or the post
        if (comment.user.toString() !== req.user._id.toString() && 
            post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this comment"
            });
        }

        post.comments = post.comments.filter(c => c._id.toString() !== commentId);
        await post.save();

        res.status(200).json({
            success: true,
            message: "Comment deleted"
        });
    } catch (error) {
        console.error("Delete comment error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search posts by hashtag
export const searchByHashtag = async (req, res) => {
    try {
        const { tag } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ hashtags: tag.toLowerCase() })
            .populate('user', 'username full_name profile_picture is_verified')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalPosts = await Post.countDocuments({ hashtags: tag.toLowerCase() });

        res.status(200).json({
            success: true,
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                hasMore: skip + posts.length < totalPosts
            }
        });
    } catch (error) {
        console.error("Search by hashtag error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
