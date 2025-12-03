import React, { useState, useEffect } from 'react'
import { dummyConnectionsData } from '../asset/assets'
import { Eye, MessageSquare, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { connectionAPI, messageAPI, userAPI } from '../api'
import { useApp } from '../context/AppContext'
import Loading from '../components/Loading'

const Messages = () => {
    const navigate = useNavigate();
    const { user } = useApp();
    const [users, setUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Fetch following users, connections, and recent conversations
            const results = await Promise.allSettled([
                connectionAPI.getFollowing(user._id),
                connectionAPI.getConnections(),
                messageAPI.getConversations(),
                userAPI.getSuggestions()
            ]);

            let allUsers = [];

            // Get following
            if (results[0].status === 'fulfilled' && results[0].value.data.success) {
                allUsers = [...allUsers, ...(results[0].value.data.following || [])];
            }

            // Get connections
            if (results[1].status === 'fulfilled' && results[1].value.data.success) {
                const connections = results[1].value.data.connections || [];
                connections.forEach(conn => {
                    if (!allUsers.find(u => u._id === conn._id)) {
                        allUsers.push(conn);
                    }
                });
            }

            // Get conversations
            if (results[2].status === 'fulfilled' && results[2].value.data.success) {
                setConversations(results[2].value.data.conversations || []);
            }

            // If no users found, get suggestions
            if (allUsers.length === 0 && results[3].status === 'fulfilled' && results[3].value.data.success) {
                allUsers = results[3].value.data.users || [];
            }

            // Remove duplicates and current user
            const uniqueUsers = allUsers.filter((u, index, self) => 
                u._id !== user._id && self.findIndex(t => t._id === u._id) === index
            );

            setUsers(uniqueUsers.length > 0 ? uniqueUsers : dummyConnectionsData);
        } catch (error) {
            console.error('Error fetching messages data:', error);
            // Fallback to dummy data
            setUsers(dummyConnectionsData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setUsers(dummyConnectionsData);
            setLoading(false);
        }
    }, [user]);

    // Combine users with conversation data
    const usersWithMessages = users.map(userItem => {
        const conversation = conversations.find(
            c => c.otherUser?._id === userItem._id
        );
        return {
            ...userItem,
            lastMessage: conversation?.lastMessage,
            unreadCount: conversation?.unreadCount || 0
        };
    });

    if (loading) return <Loading />;

    return (
        <div className='min-h-screen relative bg-slate-50'>
            <div className='max-w-6xl mx-auto p-6'>
                {/* Title */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-slate-900 mb-2'>Messages</h1>
                    <p className='text-slate-600'>Talk to your friends & family</p>
                </div>
                {/* Users list */}
                <div className='flex flex-col gap-3'>
                    {usersWithMessages.length > 0 ? (
                        usersWithMessages.map((userItem) => (
                            <div 
                                key={userItem._id} 
                                className='flex flex-wrap items-start gap-3 p-4 bg-white shadow rounded-lg hover:bg-slate-50 transition cursor-pointer'
                                onClick={() => navigate(`/messages/${userItem._id}`)}
                            >
                                <img 
                                    src={userItem.profile_picture || `https://ui-avatars.com/api/?name=${userItem.full_name}&background=6366f1&color=fff`} 
                                    alt="" 
                                    className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
                                />
                                <div className='flex-1 min-w-0'>
                                    <div className='flex items-center gap-2'>
                                        <p className='font-medium text-slate-900'>{userItem.full_name}</p>
                                        {userItem.unreadCount > 0 && (
                                            <span className='bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full'>
                                                {userItem.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className='text-slate-500 text-sm'>@{userItem.username}</p>
                                    {userItem.lastMessage ? (
                                        <p className='text-gray-600 text-sm truncate mt-1'>
                                            {userItem.lastMessage.text || '📷 Image'}
                                        </p>
                                    ) : (
                                        <p className='text-gray-400 text-sm mt-1 truncate'>{userItem.bio || 'Start a conversation'}</p>
                                    )}
                                </div>
                                <div className='flex gap-2'>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); navigate(`/messages/${userItem._id}`); }} 
                                        className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition'
                                    >
                                        <MessageSquare className='w-4 h-4' />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${userItem._id}`); }} 
                                        className='px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition'
                                    >
                                        <Eye className='w-4 h-4' />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='text-center py-16 bg-white rounded-xl shadow'>
                            <Users className='w-16 h-16 mx-auto text-slate-300 mb-4' />
                            <p className='text-gray-500 text-lg mb-2'>No users to message yet</p>
                            <p className='text-gray-400 text-sm mb-6'>Follow people to start conversations</p>
                            <button 
                                onClick={() => navigate('/discover')}
                                className='px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition'
                            >
                                Discover People
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Messages
