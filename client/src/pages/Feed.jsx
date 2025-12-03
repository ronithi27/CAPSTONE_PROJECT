import React, { useEffect, useState, useCallback } from 'react'
import { assets, dummyPostsData } from '../asset/assets'
import Loading from '../components/Loading'
import StoriesBar from '../components/StoriesBar'
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages'
import { postAPI } from '../api'
import { useApp } from '../context/AppContext'

const Feed = () => {
    const { user } = useApp()
    const [feed, setFeed] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    
    const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
        try {
            if (pageNum > 1) setLoadingMore(true)
            const { data } = await postAPI.getFeed(pageNum, 10)
            if (data.success) {
                if (append) {
                    setFeed(prev => [...prev, ...data.posts])
                } else {
                    setFeed(data.posts || [])
                }
                setHasMore(data.pagination?.hasMore || false)
            }
        } catch (error) {
            console.error('Error fetching feed:', error)
            // Fallback to dummy data if API fails
            if (!append) setFeed(dummyPostsData)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [])

    const loadMore = () => {
        if (hasMore && !loadingMore) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchFeed(nextPage, true)
        }
    }

    useEffect(() => {
        if (user) {
            fetchFeed(1)
        } else {
            // Use dummy data when not logged in
            setFeed(dummyPostsData)
            setLoading(false)
        }
    }, [user, fetchFeed])

    const handlePostDelete = (postId) => {
        setFeed(prev => prev.filter(p => p._id !== postId));
    };

  return !loading ? (
    <div className='h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
      {/* Story and Post List */}
      <div>
       <StoriesBar/>
        <div className='p-4 space-y-6'>
            {feed.length > 0 ? (
                feed.map((post)=>(
                    <PostCard key={post._id} post={post} onDelete={handlePostDelete}/>
                ))
            ) : (
                <div className='text-center py-10 bg-white rounded-lg shadow'>
                    <p className='text-gray-500'>No posts yet. Follow people to see their posts!</p>
                </div>
            )}
            {/* Load More Button */}
            {hasMore && feed.length > 0 && (
                <div className='text-center py-4'>
                    <button 
                        onClick={loadMore}
                        disabled={loadingMore}
                        className='px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-50'
                    >
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
      </div>
      {/* Right Sidebar */}
      <div className='max-xl:hidden sticky top-0'>
            <div className='max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow'>
                <h3 className='text-slate-800 font-semibold'>Suggested for you</h3>
                <img src={assets.sponsored_img} alt=""
                className='w-75 h-50 rounded-md'
                />
                <p className='font-semibold text-slate-800'>Email marketing</p>
                <p className='text-gray-500'>Super charge your marketing with a powerful, easy-to-use platform built for results.</p>
            </div>
            <RecentMessages/>
      </div>
    </div>
  ) : <Loading/>
}

export default Feed
