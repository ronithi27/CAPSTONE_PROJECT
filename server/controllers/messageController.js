import Message from "../models/Message.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { uploadToCloudinary } from "../configs/cloudinary.js";

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { userId } = req.params;
        const { text } = req.body;
        const fromUserId = req.user._id;

        // Check if recipient exists
        const recipient = await User.findById(userId);
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Can't message yourself
        if (userId === fromUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: "Cannot send message to yourself"
            });
        }

        let media_url = "";
        let message_type = "text";

        // Upload image if provided
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'pingup/messages');
            media_url = result.secure_url;
            message_type = "image";
        }

        // Validate: must have text or media
        if (!text && !media_url) {
            return res.status(400).json({
                success: false,
                message: "Message must have text or image"
            });
        }

        const message = await Message.create({
            from_user: fromUserId,
            to_user: userId,
            text: text || "",
            message_type,
            media_url
        });

        await message.populate('from_user', 'username full_name profile_picture');
        await message.populate('to_user', 'username full_name profile_picture');

        // Create notification
        await Notification.create({
            user: userId,
            from_user: fromUserId,
            type: "message",
            message: "sent you a message"
        });

        // Transform for frontend
        const messageData = {
            _id: message._id,
            from_user_id: message.from_user._id,
            to_user_id: message.to_user._id,
            from_user: message.from_user,
            to_user: message.to_user,
            text: message.text,
            message_type: message.message_type,
            media_url: message.media_url,
            seen: message.seen,
            createdAt: message.createdAt
        };

        res.status(201).json({
            success: true,
            message: messageData
        });
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get conversation with a user
export const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;
        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        const messages = await Message.find({
            $or: [
                { from_user: currentUserId, to_user: userId },
                { from_user: userId, to_user: currentUserId }
            ]
        })
        .populate('from_user', 'username full_name profile_picture')
        .populate('to_user', 'username full_name profile_picture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        // Mark messages as seen
        await Message.updateMany(
            { from_user: userId, to_user: currentUserId, seen: false },
            { seen: true }
        );

        // Get recipient info
        const recipient = await User.findById(userId)
            .select('username full_name profile_picture is_verified');

        // Transform messages for frontend
        const formattedMessages = messages.reverse().map(msg => ({
            _id: msg._id,
            from_user_id: msg.from_user._id,
            to_user_id: msg.to_user._id,
            from_user: msg.from_user,
            to_user: msg.to_user,
            text: msg.text,
            message_type: msg.message_type,
            media_url: msg.media_url,
            seen: msg.seen,
            createdAt: msg.createdAt
        }));

        res.status(200).json({
            success: true,
            messages: formattedMessages,
            recipient
        });
    } catch (error) {
        console.error("Get conversation error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all conversations (inbox)
export const getConversations = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Get latest message from each conversation
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { from_user: currentUserId },
                        { to_user: currentUserId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$from_user", currentUserId] },
                            "$to_user",
                            "$from_user"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$to_user", currentUserId] },
                                        { $eq: ["$seen", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: { "lastMessage.createdAt": -1 }
            }
        ]);

        // Populate user data
        await User.populate(conversations, {
            path: '_id',
            select: 'username full_name profile_picture is_verified'
        });

        const formattedConversations = conversations.map(conv => ({
            otherUser: conv._id,
            lastMessage: conv.lastMessage,
            unreadCount: conv.unreadCount
        }));

        res.status(200).json({
            success: true,
            conversations: formattedConversations
        });
    } catch (error) {
        console.error("Get conversations error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        await Message.updateMany(
            { from_user: userId, to_user: currentUserId, seen: false },
            { seen: true }
        );

        res.status(200).json({
            success: true,
            message: "Messages marked as read"
        });
    } catch (error) {
        console.error("Mark as read error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        // Check if user owns the message
        if (message.from_user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this message"
            });
        }

        await Message.findByIdAndDelete(messageId);

        res.status(200).json({
            success: true,
            message: "Message deleted"
        });
    } catch (error) {
        console.error("Delete message error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get unread messages count
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            to_user: req.user._id,
            seen: false
        });

        res.status(200).json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        console.error("Get unread count error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
