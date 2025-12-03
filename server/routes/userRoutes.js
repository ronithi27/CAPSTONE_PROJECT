import express from "express";
import {
    clerkWebhook,
    syncUser,
    getMyProfile,
    getUserProfile,
    updateProfile,
    updateProfilePicture,
    updateCoverPhoto,
    searchUsers,
    getUserSuggestions
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadSingle, handleMulterError } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Clerk webhook (no auth needed)
router.post("/webhook", express.raw({ type: 'application/json' }), clerkWebhook);

// Sync user from Clerk (no auth middleware - creates user if not exists)
router.post("/sync", syncUser);

// Protected routes
router.get("/me", authMiddleware, getMyProfile);
router.get("/profile/:userId", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/profile/picture", authMiddleware, uploadSingle, handleMulterError, updateProfilePicture);
router.put("/profile/cover", authMiddleware, uploadSingle, handleMulterError, updateCoverPhoto);
router.get("/search", authMiddleware, searchUsers);
router.get("/suggestions", authMiddleware, getUserSuggestions);

export default router;
