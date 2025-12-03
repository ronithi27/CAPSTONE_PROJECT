import React, { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

const ProfileModal = ({ setShowEdit, user }) => {
    const { updateProfile, updateProfilePicture, updateCoverPhoto } = useApp()
    const [editForm, setEditForm] = useState({
        username: user?.username || '',
        bio: user?.bio || '',
        location: user?.location || '',
        full_name: user?.full_name || ''
    })
    const [profilePicture, setProfilePicture] = useState(null)
    const [coverPhoto, setCoverPhoto] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value })
    }

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        setLoading(true)
        
        try {
            // Update profile info
            const profileSuccess = await updateProfile(editForm)
            
            // Update profile picture if changed
            if (profilePicture) {
                await updateProfilePicture(profilePicture)
            }
            
            // Update cover photo if changed
            if (coverPhoto) {
                await updateCoverPhoto(coverPhoto)
            }
            
            if (profileSuccess || profilePicture || coverPhoto) {
                setShowEdit(false)
            }
        } catch (error) {
            console.error('Error saving profile:', error)
            toast.error('Failed to save profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto'>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-gray-200'>
                    <h1 className='text-xl font-bold text-gray-900'>Edit Profile</h1>
                    <button 
                        onClick={() => setShowEdit(false)} 
                        className='p-2 hover:bg-gray-100 rounded-full transition'
                    >
                        <X className='w-5 h-5 text-gray-500' />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveProfile} className='p-4 space-y-5'>
                    {/* Cover Photo */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Cover Photo</label>
                        <div className='relative h-24 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 rounded-lg overflow-hidden'>
                            {(coverPhoto || user?.cover_photo) && (
                                <img 
                                    src={coverPhoto ? URL.createObjectURL(coverPhoto) : user?.cover_photo} 
                                    alt="Cover" 
                                    className='w-full h-full object-cover' 
                                />
                            )}
                            <label htmlFor='cover-photo' className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition cursor-pointer'>
                                <span className='text-white text-sm font-medium'>Change Cover</span>
                            </label>
                            <input 
                                type='file' 
                                id='cover-photo' 
                                accept='image/*' 
                                onChange={(e) => setCoverPhoto(e.target.files[0])} 
                                className='hidden' 
                            />
                        </div>
                    </div>

                    {/* Profile Picture */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Profile Picture</label>
                        <div className='flex items-center gap-4'>
                            <div className='relative'>
                                <img 
                                    src={profilePicture ? URL.createObjectURL(profilePicture) : user?.profile_picture} 
                                    alt={user?.full_name} 
                                    className='w-20 h-20 rounded-full object-cover border-2 border-gray-200'
                                />
                                <label htmlFor='profile-picture' className='absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 hover:opacity-100 transition cursor-pointer'>
                                    <span className='text-white text-xs font-medium'>Change</span>
                                </label>
                            </div>
                            <input 
                                type='file' 
                                id='profile-picture' 
                                accept='image/*' 
                                onChange={(e) => setProfilePicture(e.target.files[0])} 
                                className='hidden' 
                            />
                            <label htmlFor='profile-picture' className='text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium'>
                                Upload new photo
                            </label>
                        </div>
                    </div>

                    {/* Full Name */}
                    <div>
                        <label htmlFor='full_name' className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
                        <input 
                            type='text' 
                            id='full_name' 
                            name='full_name'
                            value={editForm.full_name} 
                            onChange={handleChange}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                            placeholder='Your full name'
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label htmlFor='username' className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
                        <div className='flex'>
                            <span className='inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm'>@</span>
                            <input 
                                type='text' 
                                id='username' 
                                name='username'
                                value={editForm.username} 
                                onChange={handleChange}
                                className='flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                placeholder='username'
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label htmlFor='bio' className='block text-sm font-medium text-gray-700 mb-1'>Bio</label>
                        <textarea 
                            id='bio' 
                            name='bio'
                            value={editForm.bio} 
                            onChange={handleChange}
                            rows='3'
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none'
                            placeholder='Tell us about yourself...'
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor='location' className='block text-sm font-medium text-gray-700 mb-1'>Location</label>
                        <input 
                            type='text' 
                            id='location' 
                            name='location'
                            value={editForm.location} 
                            onChange={handleChange}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                            placeholder='City, Country'
                        />
                    </div>

                    {/* Buttons */}
                    <div className='flex gap-3 pt-4 border-t border-gray-200'>
                        <button 
                            type='button' 
                            onClick={() => setShowEdit(false)}
                            className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium'
                        >
                            Cancel
                        </button>
                        <button 
                            type='submit'
                            disabled={loading}
                            className='flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2'
                        >
                            {loading ? (
                                <>
                                    <Loader2 className='w-4 h-4 animate-spin' />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProfileModal
