import { BadgeCheck, Heart, MessageCircle, Share2, Loader2, Trash2, MoreVertical } from 'lucide-react'
import moment from 'moment/moment'
import React, { useState } from 'react'   
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const PostCard = ({ post, onDelete }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useApp();
    
    const postWithHashtags = post.content?.replace(/#(\w+)/g, '<span class="text-indigo-600 cursor-pointer">#$1</span>') || '';
    
    const [likesCount, setLikesCount] = useState(post.likes_count || post.likes?.length || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [liked, setLiked] = useState(
        currentUser ? (post.likes || []).some(id => String(id) === String(currentUser._id)) : false
    );

    // Check if current user is the post creator
    const isOwner = currentUser && String(post.user?._id) === String(currentUser._id);

    const handleLike = async () => {
        if (!currentUser) {
            toast.error('Please login to like posts');
            return;
        }

        // Prevent double clicking
        if (isLiking) return;

        setIsLiking(true);
        
        // Optimistic update
        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
        
        try {
            const { data } = await postAPI.toggleLike(post._id);
            if (data.success) {
                // Use server response to ensure consistency
                setLiked(data.isLiked);
                setLikesCount(data.likes_count);
            } else {
                // Revert on failure
                setLiked(wasLiked);
                setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
            }
        } catch (error) {
            console.error('Error liking post:', error);
            // Revert on error
            setLiked(wasLiked);
            setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
            toast.error('Failed to like post');
        } finally {
            setIsLiking(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Post by ${post.user?.full_name}`,
                text: post.content?.substring(0, 100),
                url: `${window.location.origin}/post/${post._id}`
            });
        } else {
            navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleDelete = async () => {
        if (!isOwner) return;
        
        if (!confirm('Are you sure you want to delete this post?')) return;

        setIsDeleting(true);
        setShowMenu(false);
        
        try {
            const { data } = await postAPI.delete(post._id);
            if (data.success) {
                toast.success('Post deleted successfully');
                if (onDelete) {
                    onDelete(post._id);
                }
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Failed to delete post');
        } finally {
            setIsDeleting(false);
        }
    };

    // Don't render if deleted
    if (isDeleting) {
        return (
            <div className="bg-white rounded-xl shadow p-4 w-full max-w-2xl flex items-center justify-center">
                <Loader2 className='w-6 h-6 animate-spin text-gray-400' />
                <span className='ml-2 text-gray-500'>Deleting...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
            {/* user info */}
            <div className='flex items-center justify-between'>
                <div 
                    onClick={() => navigate(`/profile/${post.user?._id}`)} 
                    className='inline-flex items-center gap-3 cursor-pointer'
                >
                    <img 
                        src={post.user?.profile_picture} 
                        alt="" 
                        className='w-10 h-10 rounded-full shadow'
                    />
                    <div>
                        <div className='flex items-center space-x-1'>
                            <span className='hover:text-indigo-600 transition'>{post.user?.full_name}</span>
                            {post.user?.is_verified && <BadgeCheck className='w-4 h-4 text-blue-500'/>}
                        </div>
                        <div className='text-sm text-gray-500'>
                            @{post.user?.username} · {moment(post.createdAt).fromNow()}
                        </div>
                    </div>
                </div>
                
                {/* Delete Menu for Owner */}
                {isOwner && (
                    <div className='relative'>
                        <button 
                            onClick={() => setShowMenu(!showMenu)}
                            className='p-2 hover:bg-gray-100 rounded-full transition'
                        >
                            <MoreVertical className='w-5 h-5 text-gray-500' />
                        </button>
                        {showMenu && (
                            <div className='absolute right-0 top-10 bg-white shadow-lg rounded-lg py-2 z-10 min-w-32'>
                                <button 
                                    onClick={handleDelete}
                                    className='w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 flex items-center gap-2 text-sm'
                                >
                                    <Trash2 className='w-4 h-4' />
                                    Delete Post
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* content */}
            {post.content && (
                <div 
                    className='text-gray-700 text-sm whitespace-pre-line' 
                    dangerouslySetInnerHTML={{ __html: postWithHashtags }}
                />
            )}
            
            {/* IMAGE */}
            {post.image_urls?.length > 0 && (
                <div className={`grid gap-2 ${post.image_urls.length === 1 ? '' : 'grid-cols-2'}`}>
                    {post.image_urls.map((img, index) => (
                        <img 
                            key={index} 
                            src={img} 
                            alt="" 
                            className={`w-full object-cover rounded-lg ${
                                post.image_urls.length === 1 ? 'h-auto max-h-96' : 'h-48'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* ACTIONS */}
            <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300'>
                <button 
                    onClick={handleLike}
                    disabled={isLiking}
                    className='flex items-center gap-1 hover:text-red-500 transition disabled:opacity-50'
                >
                    {isLiking ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                        <Heart 
                            className={`w-4 h-4 cursor-pointer ${
                                liked ? 'text-red-500 fill-red-500' : 'hover:text-red-500 hover:fill-red-500'
                            }`}
                        />
                    )}
                    <span>{likesCount}</span>
                </button>
                <button 
                    onClick={() => navigate(`/post/${post._id}`)}
                    className='flex items-center gap-1 hover:text-indigo-600 transition'
                >
                    <MessageCircle className='w-4 h-4 cursor-pointer'/>
                    <span>{post.comments_count || post.comments?.length || 0}</span>
                </button>
                <button 
                    onClick={handleShare}
                    className='flex items-center gap-1 hover:text-indigo-600 transition'
                >
                    <Share2 className='w-4 h-4 cursor-pointer'/>
                    <span>{post.shares_count || 0}</span>
                </button>
            </div>
        </div>
    );
}

export default PostCard
