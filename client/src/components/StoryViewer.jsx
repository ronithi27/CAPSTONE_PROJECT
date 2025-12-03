import { BadgeCheck, X, Trash2, Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { storyAPI } from '../api'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

const StoryViewer = ({viewStory, setViewStory, onDelete}) => {
    const { user: currentUser } = useApp();
    const [Progress, setProgress] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    // Check if current user is the story creator
    const isOwner = currentUser && String(viewStory?.user?._id) === String(currentUser._id);

    useEffect(()=>{
        let timer, progressInterval;
        if(viewStory && viewStory.media_type !== "video"){
            setProgress(0);

            const duration = 10000;
            const setTime = 100;
            let elapsed = 0;

            progressInterval = setInterval(()=>{
                elapsed += setTime;
                setProgress((elapsed/duration)*100)
            }, setTime);
            // Close the story after duration(10sec)
            timer = setTimeout(()=>{
                setViewStory(null)
            }, duration);
        }
        return ()=>{
            clearTimeout(timer);
            clearInterval(progressInterval);
        }
    },[viewStory, setViewStory])

    const handleClose = () =>{
        setViewStory(null);
    }

    const handleDelete = async () => {
        if (!isOwner || !viewStory?._id) return;
        
        if (!confirm('Are you sure you want to delete this story?')) return;

        setIsDeleting(true);
        try {
            const { data } = await storyAPI.delete(viewStory._id);
            if (data.success) {
                toast.success('Story deleted successfully');
                if (onDelete) {
                    onDelete(viewStory._id);
                }
                setViewStory(null);
            }
        } catch (error) {
            console.error('Error deleting story:', error);
            toast.error('Failed to delete story');
        } finally {
            setIsDeleting(false);
        }
    };

    if(!viewStory) return null;

    const renderContent = () =>{
        switch(viewStory.media_type){
            case "image":
                return (
                    <img src={viewStory.media_url} alt="" className='max-w-full max-h-screen object-contain'/>
                );
            case "text":
                return (
                    <div className='w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center' >
                        {viewStory.content}
                    </div>
                );
            case "video":
                return (
                    <video onEnded={()=>{setViewStory(null)}} src={viewStory.media_url} className='max-h-screen' controls autoPlay />
                );
            default:
                return null;
        }
    }
  return (
    <div className='fixed inset-0 bg-black bg-opacity-90 z-110 flex items-center justify-center' style={{backgroundColor: viewStory.media_type === "text" ? viewStory.background_color : "#000000"}}>
      {/* Progress Bar */}
      <div className='absolute top-0 left-0 w-full h-1 bg-gray-700'>
        <div className='h-full bg-white transition-all duration-100 linear' style={{width:`${Progress}%`}}>
        </div>
      </div>
      {/* User Info */}
      <div className='absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded bg-black/50'>
        <img src={viewStory.user?.profile_picture}
        alt="" className='size-7 sm:size-8 rounded-full object-cover border border-white'/>
        <div className="text-white font-medium flex items-center gap-1.5">
            <span>{viewStory.user?.full_name}</span>
            <BadgeCheck size={18}/>
        </div>
      </div>
      {/* Close Button */}
        <button onClick={handleClose} className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none">
            <X className='w-8 h-8 hover:scale-110 transition cursor-pointer'/>
        </button>
        
        {/* Delete Button (only for owner) */}
        {isOwner && (
            <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="absolute bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
            >
                {isDeleting ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                    <Trash2 className='w-4 h-4' />
                )}
                {isDeleting ? 'Deleting...' : 'Delete Story'}
            </button>
        )}
        
        {/* Content Wrapper */}
        <div className='max-w-[90vw] max-h-[90vh] flex items-center justify-center'>
            {renderContent()}

        </div>
    </div>
  )
}

export default StoryViewer
