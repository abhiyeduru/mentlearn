import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const AdminLearnerExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    studentName: '',
    achievement: '',
    videoUrl: '',
    thumbnailUrl: '',
    active: true,
    priority: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'learnerExperiences'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      setExperiences(data);
    } catch (e) {
      console.error('Failed to load learner experiences:', e);
      alert('Failed to load learner experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingThumbnail(true);
      const url = await uploadToCloudinary(file, 'image');
      setFormData({ ...formData, thumbnailUrl: url });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentName || !formData.videoUrl) {
      alert('Please fill in student name and video URL');
      return;
    }

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'learnerExperiences', editingId), {
          ...formData,
          updatedAt: new Date()
        });
        alert('Learner experience updated successfully!');
      } else {
        await addDoc(collection(db, 'learnerExperiences'), {
          ...formData,
          createdAt: new Date()
        });
        alert('Learner experience added successfully!');
      }
      resetForm();
      loadExperiences();
    } catch (e) {
      console.error('Error saving:', e);
      alert('Failed to save learner experience');
    }
  };

  const handleEdit = (exp) => {
    setFormData({
      studentName: exp.studentName || '',
      achievement: exp.achievement || '',
      videoUrl: exp.videoUrl || '',
      thumbnailUrl: exp.thumbnailUrl || '',
      active: exp.active !== false,
      priority: exp.priority || 0
    });
    setEditingId(exp.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this learner experience?')) {
      try {
        await deleteDoc(doc(db, 'learnerExperiences', id));
        alert('Learner experience deleted successfully!');
        loadExperiences();
      } catch (e) {
        console.error('Error deleting:', e);
        alert('Failed to delete learner experience');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      achievement: '',
      videoUrl: '',
      thumbnailUrl: '',
      active: true,
      priority: 0
    });
    setIsEditing(false);
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Learner Experiences</h1>
          <p className="mt-2 text-gray-600">Add, edit, or remove student video testimonials</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Edit Learner Experience' : 'Add New Learner Experience'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Sharmila Dokala"
                required
              />
            </div>

            {/* Achievement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Achievement/Title
              </label>
              <input
                type="text"
                value={formData.achievement}
                onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Associate Engineer, B.Com Graduate Tech Placement"
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL *
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              <p className="mt-1 text-sm text-gray-500">Paste the full YouTube video URL</p>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Thumbnail (Optional)
              </label>
              {formData.thumbnailUrl && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="h-32 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                disabled={uploadingThumbnail}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              {uploadingThumbnail && <p className="mt-2 text-sm text-blue-600">Uploading...</p>}
              <p className="mt-1 text-sm text-gray-500">If not provided, YouTube thumbnail will be used</p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority (higher shows first)
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                Active (visible on landing page)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {isEditing ? 'Update Experience' : 'Add Experience'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List of Experiences */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Learner Experiences ({experiences.length})
          </h2>
          {experiences.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No learner experiences added yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="relative h-40 bg-gray-100">
                    {exp.thumbnailUrl ? (
                      <img
                        src={exp.thumbnailUrl}
                        alt={exp.studentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                      </div>
                    )}
                    {!exp.active && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                        Inactive
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{exp.studentName}</h3>
                    {exp.achievement && (
                      <p className="text-sm text-gray-600 mb-2">{exp.achievement}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-3">Priority: {exp.priority || 0}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="flex-1 bg-blue-600 text-white py-1.5 px-3 rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="flex-1 bg-red-600 text-white py-1.5 px-3 rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLearnerExperiences;
