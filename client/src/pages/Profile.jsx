import React, { useEffect, useState } from 'react'
import { dummyPostsData, dummyUserData } from '../asset/assets';
import Loading from '../components/Loading';
import { useParams, Link } from 'react-router-dom';
import UserProfileInfo from '../components/UserProfileInfo';
import PostCard from '../components/PostCard';
import moment from 'moment';
import ProfileModal from '../components/profileModal';
import { userAPI, postAPI } from '../api';
import { useApp } from '../context/AppContext';

const Profile = () => {
    const { profileId } = useParams();
    const { user: currentUser, refetchUser, loading: contextLoading } = useApp();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [showEdit, setShowEdit] = useState(false);
    const [loading, setLoading] = useState(true);

    const isOwnProfile = !profileId || profileId === currentUser?._id;

    const fetchProfile = async () => {
        setLoading(true);
        try {
            // If no profileId or viewing own profile
            if (isOwnProfile && currentUser) {
                setUser(currentUser);
                // Fetch own posts
                try {
                    const { data } = await postAPI.getUserPosts(currentUser._id);
                    if (data.success) {
                        setPosts(data.posts);
                    }
                } catch (err) {
                    console.log('Could not fetch posts:', err);
                    setPosts(dummyPostsData);
                }
            } else if (profileId) {
                // Fetch other user's profile
                const { data } = await userAPI.getProfile(profileId);
                if (data.success) {
                    setUser(data.user);
                }
                // Fetch their posts
                try {
                    const postsRes = await postAPI.getUserPosts(profileId);
                    if (postsRes.data.success) {
                        setPosts(postsRes.data.posts);
                    }
                } catch (err) {
                    console.log('Could not fetch posts:', err);
                    setPosts(dummyPostsData);
                }
            } else if (!profileId && !currentUser) {
                // No profileId and no currentUser - use dummy data for demo
                setUser(dummyUserData);
                setPosts(dummyPostsData);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback to dummy data
            setUser(dummyUserData);
            setPosts(dummyPostsData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Wait for context to finish loading before fetching profile
        if (!contextLoading) {
            fetchProfile();
        }
    }, [profileId, currentUser?._id, contextLoading]);

    // Refresh data when edit modal closes
    const handleEditClose = () => {
        setShowEdit(false);
        if (isOwnProfile) {
            refetchUser();
        }
    };
    
    return (loading || contextLoading) ? (
        <Loading />
    ) : user ? (
        <div className='relative h-full overflow-y-scroll bg-gray-50 p-6'>
            <div className='max-w-3xl mx-auto'>
                {/* Profile Header */}
                <div className='bg-white rounded-2xl shadow overflow-hidden'>
                    {/* Cover-Image */}
                    <div className='h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'>
                        {user.cover_photo && <img src={user.cover_photo} alt="Cover" className='w-full h-full object-cover'/>}
                    </div>
                    {/* User info */}
                    <UserProfileInfo 
                        user={user} 
                        posts={posts} 
                        profileId={profileId} 
                        setShowEdit={setShowEdit}
                        isOwnProfile={isOwnProfile}
                    />
                </div>
                {/* Tabs */}
                <div className='mt-6'>
                    <div className='bg-white rounded-xl shadow p-1 flex max-w-md mx-auto'>
                        {["posts", "media", "likes"].map((tab) => (
                            <button 
                                key={tab} 
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`} 
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                    {/* Posts */}
                    {activeTab === 'posts' && (
                        <div className='mt-6 flex flex-col items-center gap-6'>
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <PostCard key={post._id} post={post}/>
                                ))
                            ) : (
                                <p className='text-gray-500 py-10'>No posts yet</p>
                            )}
                        </div>
                    )}
                    {/* Media */}
                    {activeTab === "media" && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 mt-6 gap-2">
                            {posts.filter((post) => post.image_urls?.length > 0).length > 0 ? (
                                posts
                                    .filter((post) => post.image_urls?.length > 0)
                                    .map((post) => (
                                        post.image_urls.map((image, index) => (
                                            <Link 
                                                target='_blank'
                                                to={`/post/${post._id}`}
                                                key={`${post._id}-${index}`}
                                                className="relative block group"
                                            >
                                                <img
                                                    src={image}
                                                    className="w-full aspect-square object-cover rounded-lg"
                                                    alt=""
                                                />
                                                {/* Hover timestamp */}
                                                <p className="absolute bottom-0 right-0 text-xs p-1 px-3 
                                                    backdrop-blur-xl text-white opacity-0 
                                                    group-hover:opacity-100 transition duration-300 rounded-tl-lg">
                                                    Posted {moment(post.createdAt).fromNow()}
                                                </p>
                                            </Link>
                                        ))
                                    ))
                            ) : (
                                <p className='text-gray-500 col-span-3 text-center py-10'>No media yet</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {showEdit && <ProfileModal setShowEdit={handleEditClose} user={user} />}
        </div>
    ) : (
        <div className='flex items-center justify-center h-full'>
            <p className='text-gray-500'>User not found</p>
        </div>
    );
}

export default Profile
