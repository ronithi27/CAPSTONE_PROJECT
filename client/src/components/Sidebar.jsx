import React from 'react'
import { assets } from '../asset/assets'
import { Link, useNavigate } from 'react-router-dom'
import MenuItems from './MenuItems'
import { CirclePlus, LogOut } from 'lucide-react'
import { UserButton, useClerk } from '@clerk/clerk-react'
import { useApp } from '../context/AppContext'
/**
 * Sidebar Component
 * A responsive sidebar navigation that can be toggled open/closed on mobile devices
 * 
 * @param {boolean} sidebarOpen - Controls whether sidebar is visible on mobile
 * @param {function} setSidebarOpen - Function to toggle sidebar visibility
 */
const Sidebar = ({sidebarOpen, setSidebarOpen}) => {
    // Hook to programmatically navigate to different routes
    const navigate = useNavigate()
    const { user } = useApp();
    const { signOut } = useClerk();

  return (
    // Sidebar container with responsive styling
    // - Fixed width on desktop (w-60 xl:w-72)
    // - Absolute positioned on mobile (max-sm:absolute)
    // - Slides in/out based on sidebarOpen state
    <div className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
      
      <div className='w-full'>
        {/* Logo - Clickable to navigate to home page */}
        <img 
          onClick={() => navigate('/')} 
          src={assets.logo} 
          className='w-26 ml-7 my-2 cursor-pointer'
          alt="Logo"
        />

        {/* Divider line between logo and menu */}
        <hr className='border-gray-300 mb-8'/>

        {/* Navigation menu items */}
        <MenuItems setSidebarOpen={setSidebarOpen}/>
        <Link to='/create-post' className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer'>
            <CirclePlus className='w-5 h-5'/>
            Create Post
        </Link>
      </div>
      <div className='w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between'>
        <div className='flex gap-2 items-center cursor-pointer'>
          <UserButton />
          <div>
            <h1 className='text-sm font-medium'>{user?.full_name || 'User'}</h1>
            <p className='text-xs text-gray-500'>@{user?.username || 'username'}</p>
          </div>
        </div>
        <LogOut onClick={() => signOut()} className='w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer' />
      </div>
    </div>
  )
}

export default Sidebar
