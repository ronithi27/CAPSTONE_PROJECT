import express from "express";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getUnreadCount
} from "../controllers/notificationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Notification routes
router.get("/", getNotifications);
router.get("/unread", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:notificationId/read", markAsRead);
router.delete("/all", deleteAllNotifications);
router.delete("/:notificationId", deleteNotification);

export default router;
