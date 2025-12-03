import express from "express";
import {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getConnections,
    checkFollowStatus
} from "../controllers/connectionController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Connection routes
router.post("/follow/:userId", followUser);
router.post("/unfollow/:userId", unfollowUser);
router.get("/followers/:userId", getFollowers);
router.get("/following/:userId", getFollowing);
router.get("/connections", getConnections);
router.get("/status/:userId", checkFollowStatus);

export default router;
