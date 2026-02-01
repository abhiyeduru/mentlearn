import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, cloudinaryConfig } from '../../firebase/firebase.js';
import Navbar from '../../components/admin/Navbar.js';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaVideo, FaYoutube, FaStar, FaUpload, FaLink } from 'react-icons/fa';

const ManageShowcaseVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    videoUrl: '',
    thumbnailUrl: '',
    instructor: '',
    highlights: ['', '', ''],
    ctaText: 'Join Free Demo',
    ctaLink: '/callback',
    secondaryCtaText: '',
    secondaryCtaLink: '',
    footerText: '30-day money-back guarantee. No questions asked.',
    priority: 0,
    active: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'upload'
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const videosSnap = await getDocs(collection(db, 'showcaseVideos'));
      const videosData = videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      videosData.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      setVideos(videosData);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setError('');
      } else {
        setError('Please select a valid video file');
        e.target.value = '';
      }
    }
  };

  const uploadVideoToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('resource_type', 'video');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/video/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let videoUrl = formData.videoUrl;

      // If upload mode is 'upload' and there's a video file, upload it first
      if (uploadMode === 'upload' && videoFile) {
        setUploading(true);
        setUploadProgress(0);
        
        try {
          videoUrl = await uploadVideoToCloudinary(videoFile);
          setUploadProgress(100);
        } catch (uploadError) {
          setError('Failed to upload video: ' + uploadError.message);
          setUploading(false);
          return;
        }
        
        setUploading(false);
      }

      // Filter out empty highlights
      const filteredHighlights = formData.highlights.filter(h => h.trim() !== '');
      
      const videoData = {
        ...formData,
        videoUrl,
        videoType: uploadMode === 'upload' ? 'direct' : 'embed',
        highlights: filteredHighlights,
        updatedAt: new Date().toISOString()
      };

      if (editingVideo) {
        await updateDoc(doc(db, 'showcaseVideos', editingVideo.id), videoData);
        setSuccess('Video updated successfully!');
      } else {
        videoData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'showcaseVideos'), videoData);
        setSuccess('Video added successfully!');
      }

      loadVideos();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving video:', err);
      setError('Failed to save video: ' + err.message);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || '',
      description: video.description || '',
      category: video.category || '',
      videoUrl: video.videoUrl || '',
      thumbnailUrl: video.thumbnailUrl || '',
      instructor: video.instructor || '',
      highlights: video.highlights && video.highlights.length > 0 ? [...video.highlights, '', '', ''].slice(0, 3) : ['', '', ''],
      ctaText: video.ctaText || 'Join Free Demo',
      ctaLink: video.ctaLink || '/callback',
      secondaryCtaText: video.secondaryCtaText || '',
      secondaryCtaLink: video.secondaryCtaLink || '',
      footerText: video.footerText || '',
      priority: video.priority || 0,
      active: video.active !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await deleteDoc(doc(db, 'showcaseVideos', videoId));
      setSuccess('Video deleted successfully!');
      loadVideos();
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Failed to delete video');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      videoUrl: '',
      thumbnailUrl: '',
      instructor: '',
      highlights: ['', '', ''],
      ctaText: 'Join Free Demo',
      ctaLink: '/callback',
      secondaryCtaText: '',
      secondaryCtaLink: '',
      footerText: '30-day money-back guarantee. No questions asked.',
      priority: 0,
      active: true
    });
    setUploadMode('url');
    setVideoFile(null);
    setUploadProgress(0);
    setUploading(false);
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData({ ...formData, highlights: newHighlights });
  };

  const extractYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    
    // If already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) return url;
    
    // Extract video ID from various YouTube URL formats
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('youtube.com/watch?v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaVideo className="text-indigo-600" />
                Manage Showcase Videos
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Videos displayed before the footer on the landing page
              </p>
            </div>
            <button
              onClick={() => {
                setEditingVideo(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FaPlus className="mr-2" />
              Add New Video
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Video List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
            <ul className="divide-y divide-gray-200">
              {videos.length === 0 ? (
                <li className="px-6 py-8 text-center text-gray-500">
                  <FaVideo className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p>No showcase videos yet. Add your first video to get started.</p>
                </li>
              ) : (
                videos.map(video => (
                  <li key={video.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        {/* Thumbnail or Icon */}
                        <div className="flex-shrink-0 h-24 w-32 bg-gray-200 rounded-lg overflow-hidden">
                          {video.thumbnailUrl ? (
                            <img 
                              src={video.thumbnailUrl} 
                              alt={video.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <FaYoutube className="text-4xl text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Video Info */}
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-lg font-semibold text-gray-900 truncate">
                              {video.title || 'Untitled Video'}
                            </p>
                            {video.category && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {video.category}
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              video.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {video.active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              Priority: {video.priority || 0}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                            {video.description || 'No description'}
                          </p>
                          {video.instructor && (
                            <p className="text-xs text-gray-500">
                              Instructor: {video.instructor}
                            </p>
                          )}
                          {video.videoUrl && (
                            <p className="text-xs text-blue-600 truncate mt-1">
                              {video.videoUrl}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(video)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <FaEdit className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                          <FaTrash className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingVideo ? 'Edit Showcase Video' : 'Add New Showcase Video'}
                  </h3>
                  <button
                    onClick={handleCloseForm}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Masterclass | Dare to Dream"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Brief description of the video content"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Masterclass, Tutorial, Demo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructor Name
                      </label>
                      <input
                        type="text"
                        value={formData.instructor}
                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., John Doe"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Source *
                      </label>
                      
                      {/* Tab Navigation */}
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setUploadMode('url')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            uploadMode === 'url'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FaLink /> YouTube/Vimeo Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode('upload')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            uploadMode === 'upload'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FaUpload /> Upload Video
                        </button>
                      </div>

                      {/* URL Input Mode */}
                      {uploadMode === 'url' && (
                        <div>
                          <input
                            type="url"
                            required={uploadMode === 'url'}
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({ ...formData, videoUrl: extractYouTubeEmbedUrl(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="https://www.youtube.com/embed/... or https://youtube.com/watch?v=..."
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Paste YouTube watch URL or embed URL. It will be auto-converted to embed format.
                          </p>
                        </div>
                      )}

                      {/* File Upload Mode */}
                      {uploadMode === 'upload' && (
                        <div>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FaUpload className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">Click to upload video</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">MP4, WebM, or OGG (MAX. 100MB)</p>
                              </div>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoFileChange}
                                className="hidden"
                                required={uploadMode === 'upload' && !formData.videoUrl && !videoFile}
                              />
                            </label>
                          </div>
                          {videoFile && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                              <p className="text-sm text-green-800 flex items-center gap-2">
                                <FaVideo /> {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                              </p>
                            </div>
                          )}
                          {uploading && (
                            <div className="mt-2">
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Video will be uploaded to Cloudinary. This may take a few minutes depending on file size.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thumbnail URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.thumbnailUrl}
                        onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Key Highlights (Up to 3)
                      </label>
                      {formData.highlights.map((highlight, index) => (
                        <input
                          key={index}
                          type="text"
                          value={highlight}
                          onChange={(e) => handleHighlightChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                          placeholder={`Highlight ${index + 1}`}
                        />
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary CTA Text
                      </label>
                      <input
                        type="text"
                        value={formData.ctaText}
                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Join Free Demo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary CTA Link
                      </label>
                      <input
                        type="text"
                        value={formData.ctaLink}
                        onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="/callback"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary CTA Text (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryCtaText}
                        onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Learn More"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary CTA Link
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryCtaLink}
                        onChange={(e) => setFormData({ ...formData, secondaryCtaLink: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="/courses"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Footer Text
                      </label>
                      <input
                        type="text"
                        value={formData.footerText}
                        onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., 30-day money-back guarantee"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority (Higher = Shows First)
                      </label>
                      <input
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Active (Display on landing page)
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <FaSave className="mr-2" />
                      {editingVideo ? 'Update Video' : 'Add Video'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageShowcaseVideos;
