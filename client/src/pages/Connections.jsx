import React, { useState, useEffect } from 'react'
import { dummyConnectionsData } from '../asset/assets'
import { connectionAPI } from '../api'
import { useApp } from '../context/AppContext'
import Loading from '../components/Loading'
import UserCard from '../components/UserCard'
import { Users, UserPlus, UserCheck } from 'lucide-react'

const Connections = () => {
    const { user } = useApp();
    const [activeTab, setActiveTab] = useState('connections');
    const [connections, setConnections] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [connectionsRes, followersRes, followingRes] = await Promise.all([
                connectionAPI.getConnections(),
                connectionAPI.getFollowers(user._id),
                connectionAPI.getFollowing(user._id)
            ]);

            if (connectionsRes.data.success) {
                setConnections(connectionsRes.data.connections || []);
            }
            if (followersRes.data.success) {
                setFollowers(followersRes.data.followers || []);
            }
            if (followingRes.data.success) {
                setFollowing(followingRes.data.following || []);
            }
        } catch (error) {
            console.error('Error fetching connections:', error);
            // Fallback to dummy data
            setConnections(dummyConnectionsData);
            setFollowers(dummyConnectionsData.slice(0, 2));
            setFollowing(dummyConnectionsData.slice(1, 3));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setConnections(dummyConnectionsData);
            setLoading(false);
        }
    }, [user]);

    const getActiveList = () => {
        switch (activeTab) {
            case 'followers':
                return followers;
            case 'following':
                return following;
            default:
                return connections;
        }
    };

    const tabs = [
        { id: 'connections', label: 'Connections', icon: Users, count: connections.length },
        { id: 'followers', label: 'Followers', icon: UserPlus, count: followers.length },
        { id: 'following', label: 'Following', icon: UserCheck, count: following.length }
    ];

    // Handle unfollow - remove user from following list
    const handleUnfollow = (userId) => {
        setFollowing(prev => prev.filter(u => u._id !== userId));
        // Also update connections if they were mutually following
        setConnections(prev => prev.filter(u => u._id !== userId));
    };

    if (loading) return <Loading />;

    return (
        <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
                {/* Title */}
                <div className='mb-6 sm:mb-8'>
                    <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 mb-2'>Your Network</h1>
                    <p className='text-sm sm:text-base text-slate-600'>Manage your connections, followers, and following</p>
                </div>

                {/* Tabs */}
                <div className='flex flex-wrap gap-2 mb-8'>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                                activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 shadow'
                            }`}
                        >
                            <tab.icon className='w-4 h-4' />
                            <span>{tab.label}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                                activeTab === tab.id
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-slate-600'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Users Grid */}
                {getActiveList().length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
                        {getActiveList().map((userItem) => (
                            <UserCard 
                                key={userItem._id} 
                                user={userItem} 
                                onUnfollow={handleUnfollow}
                            />
                        ))}
                    </div>
                ) : (
                    <div className='text-center py-20 bg-white rounded-xl shadow'>
                        <Users className='w-16 h-16 mx-auto text-slate-300 mb-4' />
                        <p className='text-gray-500 text-lg'>No {activeTab} yet</p>
                        <p className='text-gray-400 text-sm mt-2'>
                            {activeTab === 'connections' && 'Connect with people to see them here'}
                            {activeTab === 'followers' && 'Your followers will appear here'}
                            {activeTab === 'following' && 'People you follow will appear here'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Connections
