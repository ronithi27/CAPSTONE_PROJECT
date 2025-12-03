import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { userAPI, notificationAPI, messageAPI } from '../api';
import { setClerkUserId } from '../api/axios';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Fetch current user from backend
    const fetchUser = async () => {
        if (!isSignedIn || !clerkUser) {
            setUser(null);
            setClerkUserId(null);
            setLoading(false);
            return;
        }

        try {
            // Set Clerk user ID for API calls
            setClerkUserId(clerkUser.id);
            
            // Try to get existing user
            try {
                const { data } = await userAPI.getMe();
                if (data.success) {
                    setUser(data.user);
                    setLoading(false);
                    return;
                }
            } catch (error) {
                // User doesn't exist, sync from Clerk
                if (error.response?.status === 401) {
                    console.log('User not found, syncing from Clerk...');
                    
                    // Sync user from Clerk data
                    const syncData = {
                        email: clerkUser.primaryEmailAddress?.emailAddress,
                        username: clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0],
                        full_name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
                        profile_picture: clerkUser.imageUrl || ''
                    };
                    
                    const { data: syncResult } = await userAPI.sync(syncData);
                    if (syncResult.success) {
                        setUser(syncResult.user);
                        toast.success('Welcome to PINGUP!');
                    }
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Error fetching/syncing user:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    // Fetch unread counts
    const fetchUnreadCounts = async () => {
        if (!user) return;
        
        try {
            const [notifRes, msgRes] = await Promise.all([
                notificationAPI.getUnreadCount(),
                messageAPI.getUnreadCount()
            ]);
            
            setUnreadNotifications(notifRes.data.unreadCount || 0);
            setUnreadMessages(msgRes.data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching unread counts:', error);
        }
    };

    // Update user profile
    const updateProfile = async (data) => {
        try {
            const { data: response } = await userAPI.updateProfile(data);
            if (response.success) {
                setUser(response.user);
                toast.success('Profile updated successfully');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
            return false;
        }
    };

    // Update profile picture
    const updateProfilePicture = async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const { data: response } = await userAPI.updateProfilePicture(formData);
            if (response.success) {
                setUser(response.user);
                toast.success('Profile picture updated');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update picture');
            return false;
        }
    };

    // Update cover photo
    const updateCoverPhoto = async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const { data: response } = await userAPI.updateCoverPhoto(formData);
            if (response.success) {
                setUser(response.user);
                toast.success('Cover photo updated');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update cover');
            return false;
        }
    };

    // Refetch user
    const refetchUser = () => {
        fetchUser();
    };

    // Effect to fetch user when Clerk is ready
    useEffect(() => {
        if (clerkLoaded) {
            fetchUser();
        }
    }, [clerkLoaded, isSignedIn, clerkUser?.id]);

    // Effect to fetch unread counts periodically
    useEffect(() => {
        if (user) {
            fetchUnreadCounts();
            const interval = setInterval(fetchUnreadCounts, 30000); // Every 30 seconds
            return () => clearInterval(interval);
        }
    }, [user]);

    const value = {
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        unreadNotifications,
        unreadMessages,
        updateProfile,
        updateProfilePicture,
        updateCoverPhoto,
        refetchUser,
        fetchUnreadCounts
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;
