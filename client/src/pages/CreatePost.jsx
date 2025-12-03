import React, { useState } from 'react'
import { dummyUserData } from '../asset/assets';
import { Image, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { postAPI } from '../api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Use real user or fallback to dummy
    const displayUser = user || dummyUserData;

    const handleSubmit = async () => {
        if (!content.trim() && images.length === 0) {
            throw new Error('Please add some content or images');
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            
            // Append all images
            images.forEach((image) => {
                formData.append('images', image);
            });

            const { data } = await postAPI.create(formData);
            
            if (data.success) {
                setContent('');
                setImages([]);
                // Navigate to feed after successful post
                setTimeout(() => navigate('/'), 1000);
                return data;
            } else {
                throw new Error(data.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
            <div className='max-w-6xl mx-auto p-6'>
                {/* Title */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-slate-900 mb-2'>
                        Create Post
                    </h1>
                    <p className='text-slate-600'>
                        Share your thoughts with your world!
                    </p>
                </div>
                {/* Form */}
                <div className='max-w-xl bg-white p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4'>
                    {/* Header */}
                    <div className='flex items-center gap-3'>
                        <img 
                            src={displayUser.profile_picture} 
                            alt={displayUser.full_name} 
                            className='w-12 h-12 rounded-full border-2 border-white shadow-md' 
                        />
                        <div>
                            <h2 className='font-semibold'>{displayUser.full_name}</h2>
                            <p className='text-sm text-gray-500'>@{displayUser.username}</p>
                        </div>
                    </div>
                    {/* Text AREA */}
                    <textarea
                        className='w-full resize-none max-h-20 mt-4 text-sm outline-none border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        rows='4'
                        placeholder='Whats on your mind?' 
                        onChange={(e) => setContent(e.target.value)} 
                        value={content}
                    ></textarea>
                    {/* Images */}
                    {images.length > 0 && (
                        <div className='grid grid-cols-3 gap-2 mt-4'>
                            {images.map((image, i) => (
                                <div className='relative group' key={i}>
                                    <img 
                                        src={URL.createObjectURL(image)} 
                                        alt={`Upload-${i}`} 
                                        className='w-full h-20 object-cover rounded-md'
                                    />
                                    <div 
                                        onClick={() => setImages(images.filter((_, j) => j !== i))} 
                                        className='absolute hidden group-hover:flex items-center justify-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer'
                                    >
                                        <X className='w-6 h-6 text-white' />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Bottom Bar */}
                    <div className='flex items-center justify-between pt-3 border-t border-gray-300'>
                        <label htmlFor='image' className='flex items-center gap-2 text-sm cursor-pointer text-indigo-600 hover:text-indigo-800'>
                            <Image className='w-6 h-6' />
                            <span>Add Image</span>
                            <input 
                                type='file' 
                                id='image' 
                                className='hidden' 
                                accept='image/*' 
                                multiple 
                                onChange={(e) => setImages([...images, ...Array.from(e.target.files)])} 
                            />
                        </label>
                        <button 
                            disabled={loading || (!content.trim() && images.length === 0)} 
                            onClick={() => toast.promise(
                                handleSubmit(),
                                {
                                    loading: 'Publishing post...',
                                    success: <p>Post Added</p>,
                                    error: (err) => <p>{err.message || 'Could not publish post.'}</p>
                                }
                            )} 
                            className='text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-8 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {loading ? 'Publishing...' : 'Publish Post'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreatePost
