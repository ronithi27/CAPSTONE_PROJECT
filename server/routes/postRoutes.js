import express from "express";
import {
    createPost,
    getFeedPosts,
    getAllPosts,
    getPost,
    getUserPosts,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
    searchByHashtag
} from "../controllers/postController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadMultiple, handleMulterError } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Post CRUD
router.post("/", uploadMultiple, handleMulterError, createPost);
router.get("/feed", getFeedPosts);
router.get("/all", getAllPosts);
router.get("/user/:userId", getUserPosts);
router.get("/hashtag/:tag", searchByHashtag);
router.get("/:postId", getPost);
router.put("/:postId", updatePost);
router.delete("/:postId", deletePost);

// Likes and Comments
router.post("/:postId/like", toggleLike);
router.post("/:postId/comment", addComment);
router.delete("/:postId/comment/:commentId", deleteComment);

export default router;
