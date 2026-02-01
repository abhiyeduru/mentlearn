import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, cloudinaryConfig } from '../../firebase/firebase.js';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FaHeading, FaVideo, FaChartLine, FaPlus, FaTrash, FaSave } from 'react-icons/fa';

export default function ManageWhyMentneo() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    videoUrl: '',
    mainHeading: 'Become the Top 1% in Tech',
    heading: 'Book a Live Class, For Free!',
    stats: [
      { number: '1200+', label: 'Placement Partners' },
      { number: '15K+', label: 'Careers Transformed' },
      { number: '100+', label: 'Capstone Projects' }
    ]
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const whyMentneoSnap = await getDocs(collection(db, 'whyMentneo'));
      
      if (whyMentneoSnap.docs.length > 0) {
        const data = whyMentneoSnap.docs[0].data();
        setFormData({
          videoUrl: data.videoUrl || '',
          mainHeading: data.mainHeading || 'Become the Top 1% in Tech',
          heading: data.heading || 'Book a Live Class, For Free!',
          stats: data.stats || [
            { number: '1200+', label: 'Placement Partners' },
            { number: '15K+', label: 'Careers Transformed' },
            { number: '100+', label: 'Capstone Projects' }
          ]
        });
        setVideoPreview(data.videoUrl || '');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        const preview = URL.createObjectURL(file);
        setVideoPreview(preview);
        setError('');
      } else {
        setError('Please select a valid video file (MP4, WebM, etc.)');
        e.target.value = '';
      }
    }
  };

  const uploadVideoToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

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
        console.error('Cloudinary upload error:', errorData);
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleStatChange = (index, field, value) => {
    const newStats = [...formData.stats];
    newStats[index][field] = value;
    setFormData({ ...formData, stats: newStats });
  };

  const addStat = () => {
    setFormData({
      ...formData,
      stats: [...formData.stats, { number: '', label: '' }]
    });
  };

  const removeStat = (index) => {
    const newStats = formData.stats.filter((_, i) => i !== index);
    setFormData({ ...formData, stats: newStats });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let videoUrl = formData.videoUrl;

      // Upload video if a new file is selected
      if (videoFile) {
        setUploadProgress(10);
        videoUrl = await uploadVideoToCloudinary(videoFile);
        setUploadProgress(100);
      }

      const dataToSave = {
        videoUrl,
        mainHeading: formData.mainHeading,
        heading: formData.heading,
        stats: formData.stats,
        updatedAt: new Date().toISOString()
      };

      // Check if document exists
      const whyMentneoSnap = await getDocs(collection(db, 'whyMentneo'));
      
      if (whyMentneoSnap.docs.length > 0) {
        // Update existing document
        const docRef = doc(db, 'whyMentneo', whyMentneoSnap.docs[0].id);
        await setDoc(docRef, dataToSave);
      } else {
        // Create new document
        await addDoc(collection(db, 'whyMentneo'), dataToSave);
      }

      setSuccess('Why Mentneo section updated successfully!');
      setVideoFile(null);
      setUploadProgress(0);
      loadData();
    } catch (err) {
      console.error('Error saving:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Why Mentneo Section</h1>
          <p className="mt-2 text-sm text-gray-600">
            Control the video, stats, and lead form heading for the Why Mentneo section
          </p>
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

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Video Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Video (MP4, WebM)
            </label>
            
            {videoPreview && (
              <div className="mb-4 relative aspect-video bg-gray-900 rounded-lg overflow-hidden max-w-2xl">
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                <span>{videoFile ? 'Change Video' : 'Upload Video'}</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
              {videoFile && (
                <span className="text-sm text-gray-600">
                  Selected: {videoFile.name}
                </span>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
              Upload a video file directly. Supported formats: MP4, WebM, MOV
            </p>
          </div>

          {/* Main Page Heading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaHeading className="inline mr-2" />
              Main Page Heading
            </label>
            <input
              type="text"
              value={formData.mainHeading}
              onChange={(e) => setFormData({ ...formData, mainHeading: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Become the Top 1% in Tech"
            />
            <p className="mt-1 text-xs text-gray-500">
              Large heading displayed at the top of the section
            </p>
          </div>

          {/* Form Heading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Heading
            </label>
            <input
              type="text"
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Book a Live Class, For Free!"
            />
            <p className="mt-1 text-xs text-gray-500">
              Heading for the lead capture form
            </p>
          </div>

          {/* Stats Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Stats (Display below video)
              </label>
              <button
                type="button"
                onClick={addStat}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                + Add Stat
              </button>
            </div>

            <div className="space-y-4">
              {formData.stats.map((stat, index) => (
                <div key={index} className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Number
                    </label>
                    <input
                      type="text"
                      value={stat.number}
                      onChange={(e) => handleStatChange(index, 'number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1200+"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Placement Partners"
                    />
                  </div>
                  {formData.stats.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStat(index)}
                      className="mt-6 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={loadData}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Preview Section */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Video + Stats */}
            <div>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                {videoPreview ? (
                  <video src={videoPreview} controls className="w-full h-full object-contain">
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No video uploaded
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {formData.stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-base font-medium text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Form Preview */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {formData.heading}
              </h3>
              <div className="space-y-3">
                <div className="h-11 bg-gray-100 rounded border border-gray-300"></div>
                <div className="h-11 bg-gray-100 rounded border border-gray-300"></div>
                <div className="h-11 bg-gray-100 rounded border border-gray-300"></div>
                <div className="h-11 bg-gray-100 rounded border border-gray-300"></div>
                <div className="h-12 bg-[#A21D4C] rounded text-white flex items-center justify-center font-semibold">
                  BOOK FREE LIVE CLASS
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
