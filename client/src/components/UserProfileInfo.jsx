import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectionAPI } from '../api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { Loader2, MessageCircle, UserPlus, UserMinus, Edit2, MapPin } from 'lucide-react';

const UserProfileInfo = ({ user, posts, profileId, setShowEdit }) => {
  const navigate = useNavigate();
  const { user: currentUser, refetchUser } = useApp();
  const [isFollowing, setIsFollowing] = useState(
    currentUser?.following?.includes(user?._id) || false
  );
  const [loading, setLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(user?.followers?.length || 0);

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please login to follow');
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        await connectionAPI.unfollow(user._id);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        toast.success(`Unfollowed ${user.full_name}`);
      } else {
        await connectionAPI.follow(user._id);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success(`Following ${user.full_name}`);
      }
      refetchUser();
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error(error.response?.data?.message || 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigate(`/messages/${user._id}`);
  };

  const isOwnProfile = !profileId || profileId === user?.id;

  return (
    <div className='relative px-6 pb-6'>
      {/* Profile Picture */}
      <div className='flex flex-col sm:flex-row sm:items-end sm:space-x-5'>
        <div className='relative -mt-16 sm:-mt-20'>
          <img
            src={user?.profile_picture}
            alt={user?.full_name}
            className='w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-lg object-cover'
          />
        </div>

        {/* Name and Actions */}
        <div className='mt-4 sm:mt-0 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-between sm:space-x-6 sm:pb-1'>
          <div className='flex-1 min-w-0'>
            <h1 className='text-2xl font-bold text-gray-900 truncate'>{user?.full_name}</h1>
            <p className='text-gray-500'>@{user?.username}</p>
          </div>
          <div className='mt-4 sm:mt-0 flex space-x-3'>
            {isOwnProfile ? (
              <button
                onClick={() => setShowEdit(true)}
                className='flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium cursor-pointer'
              >
                <Edit2 className='w-4 h-4' />
                Edit Profile
              </button>
            ) : (
              <>
                <button 
                  onClick={handleFollow}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 ${
                    isFollowing 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {loading ? (
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
                  onClick={handleMessage}
                  className='flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer'
                >
                  <MessageCircle className='w-4 h-4' />
                  Message
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {user?.bio && (
        <p className='mt-4 text-gray-700 max-w-2xl whitespace-pre-line'>{user.bio}</p>
      )}

      {/* Location */}
      {user?.location && (
        <p className='mt-2 text-gray-500 text-sm flex items-center gap-1'>
          <MapPin className='w-4 h-4' />
          {user.location}
        </p>
      )}

      {/* Stats */}
      <div className='mt-6 flex space-x-8'>
        <div className='text-center'>
          <span className='block text-xl font-bold text-gray-900'>{posts?.length || 0}</span>
          <span className='text-gray-500 text-sm'>Posts</span>
        </div>
        <div className='text-center'>
          <span className='block text-xl font-bold text-gray-900'>{followersCount}</span>
          <span className='text-gray-500 text-sm'>Followers</span>
        </div>
        <div className='text-center'>
          <span className='block text-xl font-bold text-gray-900'>{user?.following?.length || 0}</span>
          <span className='text-gray-500 text-sm'>Following</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
