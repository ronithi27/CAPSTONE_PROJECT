import User from "../models/User.js";
import Notification from "../models/Notification.js";

// Follow a user
export const followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        if (userId === currentUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself"
            });
        }

        const userToFollow = await User.findById(userId);

        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const currentUser = await User.findById(currentUserId);

        // Check if already following
        if (currentUser.following.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "Already following this user"
            });
        }

        // Add to following/followers
        currentUser.following.push(userId);
        userToFollow.followers.push(currentUserId);

        // Check if mutual follow (connection)
        if (userToFollow.following.includes(currentUserId)) {
            // Add to connections for both users
            if (!currentUser.connections.includes(userId)) {
                currentUser.connections.push(userId);
            }
            if (!userToFollow.connections.includes(currentUserId)) {
                userToFollow.connections.push(currentUserId);
            }
        }

        await currentUser.save();
        await userToFollow.save();

        // Create notification
        await Notification.create({
            user: userId,
            from_user: currentUserId,
            type: "follow",
            message: "started following you"
        });

        res.status(200).json({
            success: true,
            message: "User followed successfully",
            isFollowing: true
        });
    } catch (error) {
        console.error("Follow user error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        if (userId === currentUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot unfollow yourself"
            });
        }

        const userToUnfollow = await User.findById(userId);

        if (!userToUnfollow) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const currentUser = await User.findById(currentUserId);

        // Check if following
        if (!currentUser.following.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "Not following this user"
            });
        }

        // Remove from following/followers
        currentUser.following = currentUser.following.filter(
            id => id.toString() !== userId
        );
        userToUnfollow.followers = userToUnfollow.followers.filter(
            id => id.toString() !== currentUserId.toString()
        );

        // Remove from connections
        currentUser.connections = currentUser.connections.filter(
            id => id.toString() !== userId
        );
        userToUnfollow.connections = userToUnfollow.connections.filter(
            id => id.toString() !== currentUserId.toString()
        );

        await currentUser.save();
        await userToUnfollow.save();

        // Remove follow notification
        await Notification.findOneAndDelete({
            user: userId,
            from_user: currentUserId,
            type: "follow"
        });

        res.status(200).json({
            success: true,
            message: "User unfollowed successfully",
            isFollowing: false
        });
    } catch (error) {
        console.error("Unfollow user error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get followers
export const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const user = await User.findById(userId)
            .populate({
                path: 'followers',
                select: 'username full_name profile_picture bio is_verified',
                options: {
                    skip,
                    limit: parseInt(limit)
                }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            followers: user.followers,
            total: user.followers.length
        });
    } catch (error) {
        console.error("Get followers error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get following
export const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const user = await User.findById(userId)
            .populate({
                path: 'following',
                select: 'username full_name profile_picture bio is_verified',
                options: {
                    skip,
                    limit: parseInt(limit)
                }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            following: user.following,
            total: user.following.length
        });
    } catch (error) {
        console.error("Get following error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get connections (mutual follows)
export const getConnections = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const user = await User.findById(req.user._id)
            .populate({
                path: 'connections',
                select: 'username full_name profile_picture bio is_verified location',
                options: {
                    skip,
                    limit: parseInt(limit)
                }
            });

        res.status(200).json({
            success: true,
            connections: user.connections,
            total: user.connections.length
        });
    } catch (error) {
        console.error("Get connections error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Check if following a user
export const checkFollowStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = await User.findById(req.user._id);

        const isFollowing = currentUser.following.includes(userId);
        const isFollower = currentUser.followers.includes(userId);
        const isConnection = currentUser.connections.includes(userId);

        res.status(200).json({
            success: true,
            isFollowing,
            isFollower,
            isConnection
        });
    } catch (error) {
        console.error("Check follow status error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
