import User from "../models/User.js";

// Middleware to authenticate user via Clerk ID from headers
export const authMiddleware = async (req, res, next) => {
    try {
        const clerkId = req.headers['x-clerk-user-id'];
        
        if (!clerkId) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized - No user ID provided" 
            });
        }

        const user = await User.findOne({ clerkId });
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized - User not found" 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Authentication error" 
        });
    }
};

export default authMiddleware;
