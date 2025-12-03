import React, { useEffect, useState } from 'react'
import { dummyRecentMessagesData } from '../asset/assets'
import { Link, useNavigate } from 'react-router-dom'
import moment from 'moment'
import { messageAPI } from '../api'
import { useApp } from '../context/AppContext'

const RecentMessages = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRecentMessages = async () => {
        try {
            const { data } = await messageAPI.getConversations();
            if (data.success) {
                // Get recent conversations
                const recentConversations = data.conversations
                    ?.filter(c => c.lastMessage && c.otherUser)
                    .slice(0, 5) || [];
                setConversations(recentConversations);
            }
        } catch (error) {
            console.error('Error fetching recent messages:', error);
            // Fallback to dummy data
            setConversations(dummyRecentMessagesData.map(msg => ({
                otherUser: msg.from_user_id,
                lastMessage: msg,
                unreadCount: 0
            })));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchRecentMessages();
        } else {
            setConversations(dummyRecentMessagesData.map(msg => ({
                otherUser: msg.from_user_id,
                lastMessage: msg,
                unreadCount: 0
            })));
            setLoading(false);
        }
    }, [user]);

    if (conversations.length === 0 && !loading) {
        return null;
    }

    return (
        <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
            <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-slate-800'>Recent Messages</h3>
                <button 
                    onClick={() => navigate('/messages')}
                    className='text-indigo-500 hover:text-indigo-700 text-xs'
                >
                    View all
                </button>
            </div>
            <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>
                {conversations.map((conv, index) => (
                    <Link 
                        to={`/messages/${conv.otherUser?._id}`} 
                        key={conv.otherUser?._id || index} 
                        className='flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition'
                    >
                        <img 
                            src={conv.otherUser?.profile_picture || `https://ui-avatars.com/api/?name=${conv.otherUser?.full_name || 'User'}&background=6366f1&color=fff`} 
                            alt="" 
                            className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                        />
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center justify-between gap-2'>
                                <p className='font-semibold truncate'>{conv.otherUser?.full_name || 'User'}</p>
                                <p className='text-gray-400 text-[10px] flex-shrink-0'>
                                    {conv.lastMessage?.createdAt ? moment(conv.lastMessage.createdAt).fromNow() : ''}
                                </p>
                            </div>
                            <div className='flex items-center justify-between gap-2 mt-1'>
                                <p className='text-gray-500 truncate'>
                                    {conv.lastMessage?.text || (conv.lastMessage?.media_url ? "📷 Media" : "Start a conversation")}
                                </p>
                                {conv.unreadCount > 0 && (
                                    <span className='bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px] flex-shrink-0'>
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default RecentMessages
