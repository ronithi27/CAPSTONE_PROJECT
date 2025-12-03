import React, { useState, useEffect } from 'react'
import { dummyConnectionsData } from '../asset/assets'
import { Search } from 'lucide-react'
import Loading from '../components/Loading'
import UserCard from '../components/userCard'
import { userAPI } from '../api'
import { useApp } from '../context/AppContext'

const Discover = () => {
    const { user } = useApp();
    const [input, setInput] = useState('');
    const [users, setUsers] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);

    const fetchSuggestions = async () => {
        try {
            const { data } = await userAPI.getSuggestions();
            if (data.success) {
                setSuggestions(data.users || []);
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            // Fallback to dummy data
            setSuggestions(dummyConnectionsData);
            setUsers(dummyConnectionsData);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        if (e.key === "Enter" && input.trim()) {
            setSearchLoading(true);
            try {
                const { data } = await userAPI.searchUsers(input.trim());
                if (data.success) {
                    setUsers(data.users || []);
                }
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setSearchLoading(false);
            }
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        // Reset to suggestions if input is cleared
        if (!e.target.value.trim()) {
            setUsers(suggestions);
        }
    };

    useEffect(() => {
        if (user) {
            fetchSuggestions();
        } else {
            setUsers(dummyConnectionsData);
            setLoading(false);
        }
    }, [user]);

    if (loading) return <Loading />;

    return (
        <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
                {/* Title */}
                <div className='mb-6 sm:mb-8'>
                    <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 mb-2'>Discover People</h1>
                    <p className='text-sm sm:text-base text-slate-600'>Find and connect with new people</p>
                </div>
                {/* Search Bar */}
                <div className='mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80'>
                    <div className='p-6'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5'/>
                            <input 
                                type="text" 
                                placeholder='Search users by name or username... (Press Enter)' 
                                className='w-full pl-10 pr-4 py-3 rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition' 
                                onChange={handleInputChange} 
                                value={input} 
                                onKeyUp={handleSearch}
                            />
                        </div>
                    </div>
                </div>
                {/* Users Grid */}
                {searchLoading ? (
                    <Loading height="60vh" />
                ) : users.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
                        {users.map((userItem) => (
                            <UserCard key={userItem._id} user={userItem} />
                        ))}
                    </div>
                ) : (
                    <div className='text-center py-20'>
                        <p className='text-gray-500 text-lg'>No users found</p>
                        <p className='text-gray-400 text-sm mt-2'>Try a different search term</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Discover
