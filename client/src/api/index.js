import api from './axios';

// ==================== USER API ====================

export const userAPI = {
    // Sync user from Clerk (creates if not exists)
    sync: (userData) => api.post('/users/sync', userData),
    
    // Get current user profile
    getMe: () => api.get('/users/me'),
    
    // Get user profile by ID or username
    getProfile: (userId) => api.get(`/users/profile/${userId}`),
    
    // Update profile
    updateProfile: (data) => api.put('/users/profile', data),
    
    // Update profile picture
    updateProfilePicture: (formData) => api.put('/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Update cover photo
    updateCoverPhoto: (formData) => api.put('/users/profile/cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Search users
    searchUsers: (query) => api.get(`/users/search?q=${query}`),
    
    // Get user suggestions
    getSuggestions: () => api.get('/users/suggestions')
};

// ==================== POST API ====================

export const postAPI = {
    // Create post
    create: (formData) => api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Get feed posts
    getFeed: (page = 1, limit = 10) => api.get(`/posts/feed?page=${page}&limit=${limit}`),
    
    // Get all posts (discover)
    getAll: (page = 1, limit = 10) => api.get(`/posts/all?page=${page}&limit=${limit}`),
    
    // Get single post
    getPost: (postId) => api.get(`/posts/${postId}`),
    
    // Get user's posts
    getUserPosts: (userId, page = 1, limit = 10) => api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`),
    
    // Update post
    update: (postId, data) => api.put(`/posts/${postId}`, data),
    
    // Delete post
    delete: (postId) => api.delete(`/posts/${postId}`),
    
    // Like/unlike post
    toggleLike: (postId) => api.post(`/posts/${postId}/like`),
    
    // Add comment
    addComment: (postId, text) => api.post(`/posts/${postId}/comment`, { text }),
    
    // Delete comment
    deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comment/${commentId}`),
    
    // Search by hashtag
    searchByHashtag: (tag, page = 1) => api.get(`/posts/hashtag/${tag}?page=${page}`)
};

// ==================== STORY API ====================

export const storyAPI = {
    // Create story
    create: (formData) => api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Get stories feed
    getAll: () => api.get('/stories'),
    
    // Get user stories
    getUserStories: (userId) => api.get(`/stories/user/${userId}`),
    
    // View story
    viewStory: (storyId) => api.post(`/stories/${storyId}/view`),
    
    // Get story viewers
    getViewers: (storyId) => api.get(`/stories/${storyId}/viewers`),
    
    // Delete story
    delete: (storyId) => api.delete(`/stories/${storyId}`)
};

// ==================== CONNECTION API ====================

export const connectionAPI = {
    // Follow user
    follow: (userId) => api.post(`/connections/follow/${userId}`),
    
    // Unfollow user
    unfollow: (userId) => api.post(`/connections/unfollow/${userId}`),
    
    // Get followers
    getFollowers: (userId) => api.get(`/connections/followers/${userId}`),
    
    // Get following
    getFollowing: (userId) => api.get(`/connections/following/${userId}`),
    
    // Get connections (mutual follows)
    getConnections: () => api.get('/connections/connections'),
    
    // Check follow status
    checkStatus: (userId) => api.get(`/connections/status/${userId}`)
};

// ==================== MESSAGE API ====================

export const messageAPI = {
    // Get all conversations
    getConversations: () => api.get('/messages'),
    
    // Get conversation with user
    getConversation: (userId) => api.get(`/messages/${userId}`),
    
    // Send message
    send: (userId, formData) => api.post(`/messages/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Send text message
    sendText: (userId, text) => api.post(`/messages/${userId}`, { text }),
    
    // Mark as read
    markAsRead: (userId) => api.put(`/messages/${userId}/read`),
    
    // Delete message
    delete: (messageId) => api.delete(`/messages/${messageId}`),
    
    // Get unread count
    getUnreadCount: () => api.get('/messages/unread')
};

// ==================== NOTIFICATION API ====================

export const notificationAPI = {
    // Get all notifications
    getAll: (page = 1, limit = 20) => api.get(`/notifications?page=${page}&limit=${limit}`),
    
    // Mark as read
    markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
    
    // Mark all as read
    markAllAsRead: () => api.put('/notifications/read-all'),
    
    // Delete notification
    delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
    
    // Delete all
    deleteAll: () => api.delete('/notifications/all'),
    
    // Get unread count
    getUnreadCount: () => api.get('/notifications/unread')
};

export default {
    user: userAPI,
    post: postAPI,
    story: storyAPI,
    connection: connectionAPI,
    message: messageAPI,
    notification: notificationAPI
};
