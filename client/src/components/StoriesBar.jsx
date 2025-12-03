import React, { useEffect, useState } from 'react'
import { dummyStoriesData } from '../asset/assets'
import { Plus } from 'lucide-react'
import moment from 'moment/moment'
import StoryModel from './StoryModel'
import StoryViewer from './StoryViewer'
import { storyAPI } from '../api'
import { useApp } from '../context/AppContext'

const StoriesBar = () => {
    const { user } = useApp();
    const [stories, setStories] = useState([]);
    const [showModel, setShowModel] = useState(false);
    const [viewStory, setViewStory] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStories = async () => {
        try {
            const { data } = await storyAPI.getAll();
            if (data.success) {
                setStories(data.stories || []);
            }
        } catch (error) {
            console.error('Error fetching stories:', error);
            // Fallback to dummy data
            setStories(dummyStoriesData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchStories();
        } else {
            setStories(dummyStoriesData);
            setLoading(false);
        }
    }, [user]);

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
        const userId = story.user?._id;
        if (!acc[userId]) {
            acc[userId] = {
                user: story.user,
                stories: []
            };
        }
        acc[userId].stories.push(story);
        return acc;
    }, {});

    const handleStoryDelete = (storyId) => {
        setStories(prev => prev.filter(s => s._id !== storyId));
    };

    return (
        <div className='w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no_scrollbar overflow-x-auto px-4 '>
            <div className='flex gap-4 pb-5'>
                {/* Add stories here */}
                <div 
                    onClick={() => setShowModel(true)}  
                    className='rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white'
                >
                    <div className='h-full flex flex-col items-center justify-center p-4'>
                        <div className='size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3'>
                            <Plus className='w-5 h-5 text-white'/>
                        </div>
                        <p className='text-sm font-medium text-slate-700 text-center'>Create Story</p>
                    </div>
                </div>
                {/* Story Card */}
                {stories.map((story, index) => (
                    <div 
                        onClick={() => setViewStory(story)} 
                        key={story._id || index} 
                        className='relative rounded-lg shadow min-w-30 max-w-30 max-h-40 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95'
                    >
                        <img 
                            src={story.user?.profile_picture} 
                            alt=""
                            className='absolute size-8 top-3 left-3 z-10 rounded-full ring ring-gray-100 shadow'
                        />
                        <p className='absolute top-18 left-3 text-white/60 text-sm truncate max-w-24'>
                            {story.content}
                        </p>
                        <p className='text-white absolute bottom-1 right-2 z-10 text-xs'>
                            {moment(story.createdAt).fromNow()}
                        </p>
                        {story.media_type !== "text" && (
                            <div className='absolute inset-0 z-1 rounded-lg bg-black overflow-hidden'>
                                {story.media_type === "image" ? (
                                    <img 
                                        src={story.media_url} 
                                        alt="" 
                                        className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-80'
                                    />
                                ) : (
                                    <video 
                                        src={story.media_url} 
                                        className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80' 
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {/* ADD STORY MODEL */}
            {showModel && <StoryModel setShowModal={setShowModel} fetchStories={fetchStories} />}
            {/* View Story Model */}
            {viewStory && <StoryViewer viewStory={viewStory} setViewStory={setViewStory} onDelete={handleStoryDelete} />}
        </div>
    );
}

export default StoriesBar
