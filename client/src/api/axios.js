import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Store for clerk user id - will be set by AppContext
let clerkUserId = null;

export const setClerkUserId = (id) => {
    clerkUserId = id;
};

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth header
api.interceptors.request.use(
    (config) => {
        // Use stored clerk user ID
        if (clerkUserId) {
            config.headers['x-clerk-user-id'] = clerkUserId;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.log('Unauthorized - Please login');
        }
        return Promise.reject(error);
    }
);

export default api;
