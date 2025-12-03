import { ArrowLeft, Sparkles, TextIcon, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { storyAPI } from '../api'
import toast from 'react-hot-toast'

const StoryModel = ({ setShowModal, fetchStories }) => {
    const bgColor = ["#f87171", "#fb923c", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6"]
    const [mode, setMode] = useState("text")
    const [background, setBackground] = useState(bgColor[0])
    const [text, setText] = useState("")
    const [media, setMedia] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleMediaUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setMedia(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleCreateStory = async () => {
        if (mode === "text" && !text.trim()) {
            throw new Error("Please add some text")
        }
        if (mode === "media" && !media) {
            throw new Error("Please upload an image or video")
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('content', text)
            formData.append('background_color', background)

            if (mode === "media" && media) {
                formData.append('media', media)
                formData.append('media_type', media.type.startsWith("image") ? "image" : "video")
            } else {
                formData.append('media_type', 'text')
            }

            const { data } = await storyAPI.create(formData)

            if (data.success) {
                await fetchStories()
                setShowModal(false)
                return data
            } else {
                throw new Error(data.message || 'Failed to create story')
            }
        } catch (error) {
            console.error('Error creating story:', error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4">
            <div className='w-full max-w-md'>
                <div className='text-center mb-4 flex items-center justify-between'>
                    <button onClick={() => setShowModal(false)} className='text-white p-2 cursor-pointer'>
                        <ArrowLeft />
                    </button>
                    <h2 className='text-lg font-semibold'>Create Story</h2>
                    <span className='w-10'></span>
                </div>
                <div
                    className='rounded-lg h-96 flex items-center justify-center relative'
                    style={{ background: mode === "text" ? background : "#000" }}
                >
                    {mode === "text" && (
                        <textarea
                            className='bg-transparent w-full h-full p-6 text-white text-2xl resize-none outline-none'
                            placeholder='Share your story...'
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    )}
                    {mode === "media" && previewUrl && (
                        media?.type.startsWith("image") ? (
                            <img src={previewUrl} alt="" className='object-contain max-h-full' />
                        ) : (
                            <video src={previewUrl} className='object-contain max-h-full' controls />
                        )
                    )}
                    {mode === "media" && !previewUrl && (
                        <p className='text-gray-400'>Upload an image or video</p>
                    )}
                </div>
                {mode === "text" && (
                    <div className='flex mt-4 gap-2'>
                        {bgColor.map((color) => (
                            <button
                                key={color}
                                className={`w-6 h-6 rounded-full cursor-pointer ${background === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setBackground(color)}
                            />
                        ))}
                    </div>
                )}
                <div className='flex gap-2 mt-4'>
                    <button
                        className={`flex-1 flex items-center justify-center gap-2 p-2 cursor-pointer rounded ${mode === "text" ? "bg-white text-black" : "bg-zinc-800"}`}
                        onClick={() => { setMode("text"); setMedia(null); setPreviewUrl(null) }}
                    >
                        <TextIcon size={18} /> Text
                    </button>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${mode === "media" ? "bg-white text-black" : "bg-zinc-800"}`}>
                        <input
                            type="file"
                            accept="image/*, video/*"
                            className='hidden'
                            onChange={(e) => { handleMediaUpload(e); setMode("media") }}
                        />
                        <Upload size={18} /> Photo/Video
                    </label>
                </div>
                <button
                    disabled={loading}
                    onClick={() => toast.promise(
                        handleCreateStory(),
                        {
                            loading: "Creating story...",
                            success: "Story added!",
                            error: (err) => err.message || "Failed to create story"
                        }
                    )}
                    className='flex items-center justify-center gap-2 py-2 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 disabled:opacity-50 cursor-pointer'
                >
                    <Sparkles size={18} /> {loading ? 'Creating...' : 'Create Story'}
                </button>
            </div>
        </div>
    )
}

export default StoryModel
