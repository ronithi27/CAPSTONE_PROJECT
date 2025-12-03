import React, { useState, useEffect } from 'react'
import { MapPin, MessageCircle, UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { connectionAPI } from '../api'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

const UserCard = ({ user: cardUser, onUnfollow }) => {
    const { user: currentUser, refetchUser } = useApp();
    const navigate = useNavigate();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    // Check initial follow status
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!currentUser || !cardUser?._id) {
                setCheckingStatus(false);
                return;
            }

            // First check from currentUser data
            if (currentUser.following?.some(id => String(id) === String(cardUser._id))) {
                setIsFollowing(true);
                setCheckingStatus(false);
                return;
            }

            // If not in local data, check from API
            try {
                const { data } = await connectionAPI.checkStatus(cardUser._id);
                if (data.success) {
                    setIsFollowing(data.isFollowing || false);
                }
            } catch (error) {
                console.error('Error checking follow status:', error);
            } finally {
                setCheckingStatus(false);
            }
        };

        checkFollowStatus();
    }, [currentUser, cardUser?._id]);

    const handleFollow = async () => {
        if (!currentUser) {
            toast.error('Please login to follow');
            return;
        }

        if (loading) return;

        setLoading(true);
        const wasFollowing = isFollowing;
        
        // Optimistic update
        setIsFollowing(!wasFollowing);
        
        try {
            if (wasFollowing) {
                const { data } = await connectionAPI.unfollow(cardUser._id);
                if (data.success) {
                    toast.success(`Unfollowed ${cardUser.full_name}`);
                    if (onUnfollow) {
                        onUnfollow(cardUser._id);
                    }
                } else {
                    setIsFollowing(wasFollowing);
                }
            } else {
                const { data } = await connectionAPI.follow(cardUser._id);
                if (data.success) {
                    toast.success(`Following ${cardUser.full_name}`);
                } else {
                    setIsFollowing(wasFollowing);
                }
            }
            refetchUser();
        } catch (error) {
            console.error('Error following/unfollowing:', error);
            setIsFollowing(wasFollowing);
            toast.error(error.response?.data?.message || 'Failed to update follow status');
        } finally {
            setLoading(false);
        }
    };

    const handleConnectionRequest = () => {
        if (!currentUser) {
            toast.error('Please login first');
            return;
        }
        // Navigate to messages
        navigate(`/messages/${cardUser._id}`);
    };

    // Don't show card for current user
    if (currentUser && String(cardUser._id) === String(currentUser._id)) {
        return null;
    }

    return (
        <div className='p-4 pt-6 flex flex-col justify-between w-full bg-white shadow border border-gray-200 rounded-lg hover:shadow-md transition'>
            <div className='flex flex-col items-center gap-3'>
                <img 
                    src={cardUser.profile_picture || `https://ui-avatars.com/api/?name=${cardUser.full_name}&background=6366f1&color=fff`} 
                    alt="" 
                    className='w-16 h-16 rounded-full shadow-md mx-auto cursor-pointer hover:opacity-80 transition object-cover'
                    onClick={() => navigate(`/profile/${cardUser._id}`)}
                />
                <div className='flex flex-col items-center'>
                    <p 
                        className='font-semibold mt-4 text-slate-900 hover:text-indigo-600 cursor-pointer transition'
                        onClick={() => navigate(`/profile/${cardUser._id}`)}
                    >
                        {cardUser.full_name}
                    </p>
                    {cardUser.username && (
                        <p className='text-slate-500 font-light'>@{cardUser.username}</p>
                    )}
                    {cardUser.bio && (
                        <p className='text-slate-600 mt-2 text-center text-sm px-4 line-clamp-2'>
                            {cardUser.bio}
                        </p>
                    )}
                </div>
                <div className='flex items-center justify-center gap-2 mt-4 text-xs'>
                    {cardUser.location && (
                        <div className='flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-3 py-1.5 shadow-sm'>
                            <MapPin className='w-4 h-4 text-indigo-500' />
                            {cardUser.location}
                        </div>
                    )}
                    <div className='flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-3 py-1.5 shadow-sm'>
                        <span className='font-semibold'>{cardUser.followers?.length || 0}</span> Followers
                    </div>
                </div>
                <div className='flex mt-4 gap-2 w-full'>
                    <button 
                        disabled={loading || checkingStatus}
                        onClick={handleFollow} 
                        className={`flex-1 py-2 rounded-md flex justify-center items-center gap-2 
                            ${isFollowing 
                                ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                            } active:scale-95 transition cursor-pointer disabled:opacity-50`}
                    >
                        {loading || checkingStatus ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                        ) : isFollowing ? (
                            <>
                                <UserMinus className='w-4 h-4' />
                                Unfollow
                            </>
                        ) : (
                            <>
                                <UserPlus className='w-4 h-4' />
                                Follow
                            </>
                        )}
                    </button>
                    <button 
                        className='flex items-center justify-center w-16 border text-slate-500 group rounded-md cursor-pointer active:scale-95 transition hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200' 
                        onClick={handleConnectionRequest}
                    >
                        <MessageCircle className='w-5 h-5 group-hover:scale-105 transition' />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserCard

