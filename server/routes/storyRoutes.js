import express from "express";
import {
    createStory,
    getStories,
    getUserStories,
    viewStory,
    deleteStory,
    getStoryViewers
} from "../controllers/storyController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadSingle, handleMulterError } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Story routes
router.post("/", uploadSingle, handleMulterError, createStory);
router.get("/", getStories);
router.get("/user/:userId", getUserStories);
router.post("/:storyId/view", viewStory);
router.get("/:storyId/viewers", getStoryViewers);
router.delete("/:storyId", deleteStory);

export default router;
