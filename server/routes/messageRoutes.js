import express from "express";
import {
    sendMessage,
    getConversation,
    getConversations,
    markAsRead,
    deleteMessage,
    getUnreadCount
} from "../controllers/messageController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadSingle, handleMulterError } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Message routes
router.get("/", getConversations);
router.get("/unread", getUnreadCount);
router.get("/:userId", getConversation);
router.post("/:userId", uploadSingle, handleMulterError, sendMessage);
router.put("/:userId/read", markAsRead);
router.delete("/:messageId", deleteMessage);

export default router;
