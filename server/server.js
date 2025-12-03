import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/db.js';
import { serve } from "inngest/express";
import { inngest, functions } from './inngest/index.js';

// Import routes
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();

// Connect to database
await connectDB();

// Middleware
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
app.use(cors({
    origin: clientUrl,
    credentials: true
}));
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'PINGUP API Server is running',
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Inngest route
app.use("/api/inngest", serve({ client: inngest, functions }));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📍 API available at http://localhost:${port}`);
});