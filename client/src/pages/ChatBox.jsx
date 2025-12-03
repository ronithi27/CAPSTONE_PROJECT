import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dummyMessagesData, dummyUserData } from '../asset/assets'
import { messageAPI, userAPI } from '../api'
import { useApp } from '../context/AppContext'
import Loading from '../components/Loading'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

const ChatBox = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useApp();
    
    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const fetchConversation = async () => {
        try {
            // Fetch other user's profile
            const userRes = await userAPI.getProfile(userId);
            if (userRes.data.success) {
                setOtherUser(userRes.data.user);
            }

            // Fetch messages
            const messagesRes = await messageAPI.getConversation(userId);
            if (messagesRes.data.success) {
                setMessages(messagesRes.data.messages || []);
            }

            // Mark messages as read
            await messageAPI.markAsRead(userId);
        } catch (error) {
            console.error('Error fetching conversation:', error);
            // Fallback to dummy data
            setOtherUser(dummyUserData);
            setMessages(dummyMessagesData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchConversation();
        }
    }, [userId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!text.trim() && !image) return;

        setSending(true);
        try {
            const formData = new FormData();
            if (text.trim()) {
                formData.append('text', text);
            }
            if (image) {
                formData.append('image', image);
            }

            const { data } = await messageAPI.send(userId, formData);
            
            if (data.success) {
                // Add message to list
                setMessages(prev => [...prev, data.message]);
                setText("");
                setImage(null);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <Loading />;

    return otherUser && (
        <div className='flex flex-col h-full'>
            {/* Header */}
            <div className='flex items-center gap-3 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300'>
                <button 
                    onClick={() => navigate('/messages')}
                    className='p-2 hover:bg-white/50 rounded-full transition md:hidden'
                >
                    <ArrowLeft className='w-5 h-5' />
                </button>
                <img 
                    src={otherUser.profile_picture} 
                    alt={otherUser.full_name} 
                    className='w-8 h-8 rounded-full border-2 border-white shadow-md cursor-pointer' 
                    onClick={() => navigate(`/profile/${otherUser._id}`)}
                />
                <div 
                    className='cursor-pointer'
                    onClick={() => navigate(`/profile/${otherUser._id}`)}
                >
                    <p className='font-medium'>{otherUser.full_name}</p>
                    <p className='text-sm text-gray-500 -mt-1.5'>@{otherUser.username}</p>
                </div>
            </div>
            
            {/* Messages */}
            <div className='flex-1 p-5 md:px-10 overflow-y-scroll'>
                <div className='space-y-4 max-w-4xl mx-auto'>
                    {messages.length > 0 ? (
                        messages
                            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                            .map((message, index) => {
                                // Handle different ID formats (string or ObjectId)
                                const fromId = message.from_user_id?._id || message.from_user_id || message.from_user?._id;
                                const currentId = currentUser?._id;
                                const isSentByMe = String(fromId) === String(currentId);
                                return (
                                <div 
                                    key={message._id || index} 
                                    className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`p-3 max-w-xs md:max-w-sm lg:max-w-md ${
                                        isSentByMe 
                                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                                            : 'bg-gray-200 text-gray-900 rounded-bl-none'
                                    } rounded-lg shadow overflow-hidden`}>
                                        {message.message_type === 'image' && message.media_url && (
                                            <img 
                                                src={message.media_url} 
                                                alt="" 
                                                className={`w-full rounded-lg ${message.text ? 'mb-2' : ''}`} 
                                            />
                                        )}
                                        {message.text && <p>{message.text}</p>}
                                    </div>
                                    <span className={`text-xs text-gray-400 mt-1 ${isSentByMe ? 'mr-1' : 'ml-1'}`}>
                                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                );
                            })
                    ) : (
                        <div className='text-center py-10'>
                            <p className='text-gray-500'>No messages yet. Say hello! 👋</p>
                        </div>
                    )}
                    <div ref={messagesEndRef}></div>
                </div>
            </div>

            {/* Input Box */}
            <div className='p-4 md:px-10 lg:px-42 bg-white border-t border-gray-300'>
                {/* Image Preview */}
                {image && (
                    <div className='mb-2 relative inline-block'>
                        <img 
                            src={URL.createObjectURL(image)} 
                            alt="Preview" 
                            className='h-20 rounded-lg'
                        />
                        <button 
                            onClick={() => setImage(null)}
                            className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs'
                        >
                            ✕
                        </button>
                    </div>
                )}
                <div className='flex items-center gap-3 p-1.5 pl-5 bg-gray-50 w-full max-w-xl mx-auto rounded-full shadow'>
                    <input 
                        type="text" 
                        value={text} 
                        onKeyDown={e => e.key === 'Enter' && !sending && sendMessage()} 
                        onChange={(e) => setText(e.target.value)} 
                        placeholder='Type your message...' 
                        className='flex-1 bg-transparent px-2 py-2 outline-none text-slate-700'
                        disabled={sending}
                    />
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setImage(e.target.files[0])} 
                        className='hidden' 
                        id='image-upload'
                    />
                    <label htmlFor='image-upload' className='cursor-pointer text-indigo-500 hover:text-indigo-700 p-2'>
                        <ImageIcon className='w-5 h-5' />
                    </label>
                    <button 
                        onClick={sendMessage} 
                        disabled={sending || (!text.trim() && !image)}
                        className='bg-indigo-600 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {sending ? '...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatBox
