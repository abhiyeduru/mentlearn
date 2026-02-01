import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUpload, FaStar } from 'react-icons/fa/index.esm.js';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    quote: '',
    imageUrl: '',
    companyLogo: '',
    company: '',
    progress: '',
    rating: 5,
    featured: false,
    active: true,
    priority: 1
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const testimonialsSnap = await getDocs(collection(db, 'testimonials'));
      const testimonialsData = testimonialsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      testimonialsData.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      alert('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, type = 'student') => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const downloadURL = await uploadToCloudinary(file, 'image');
      
      if (type === 'logo') {
        setFormData({ ...formData, companyLogo: downloadURL });
        alert('Company logo uploaded successfully!');
      } else {
        setFormData({ ...formData, imageUrl: downloadURL });
        alert('Student photo uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload ${type === 'logo' ? 'logo' : 'photo'}. Error: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.quote) {
      alert('Name and quote are required!');
      return;
    }

    try {
      const testimonialData = {
        ...formData,
        rating: parseInt(formData.rating) || 5,
        priority: parseInt(formData.priority) || 1,
        updatedAt: new Date().toISOString()
      };

      if (editingTestimonial) {
        await updateDoc(doc(db, 'testimonials', editingTestimonial.id), testimonialData);
        alert('Testimonial updated successfully!');
      } else {
        await addDoc(collection(db, 'testimonials'), {
          ...testimonialData,
          createdAt: new Date().toISOString()
        });
        alert('Testimonial created successfully!');
      }

      resetForm();
      loadTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Failed to save testimonial');
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name || '',
      role: testimonial.role || '',
      quote: testimonial.quote || '',
      imageUrl: testimonial.imageUrl || '',
      companyLogo: testimonial.companyLogo || '',
      company: testimonial.company || '',
      progress: testimonial.progress || '',
      rating: testimonial.rating || 5,
      featured: testimonial.featured || false,
      active: testimonial.active !== false,
      priority: testimonial.priority || 1
    });
    setShowForm(true);
  };

  const handleDelete = async (testimonialId) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await deleteDoc(doc(db, 'testimonials', testimonialId));
      alert('Testimonial deleted successfully!');
      loadTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Failed to delete testimonial');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      quote: '',
      imageUrl: '',
      companyLogo: '',
      company: '',
      progress: '',
      rating: 5,
      featured: false,
      active: true,
      priority: 1
    });
    setEditingTestimonial(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Testimonials</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? <FaTimes className="mr-2" /> : <FaPlus className="mr-2" />}
            {showForm ? 'Cancel' : 'Add Testimonial'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingTestimonial ? 'Edit Testimonial' : 'Create New Testimonial'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Photo (Optional - will use avatar if not provided)
                </label>
                {formData.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={formData.imageUrl}
                      alt="Student preview"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <FaUpload className="mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Company Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo (Optional - e.g., Amazon, Google)
                </label>
                {formData.companyLogo && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={formData.companyLogo}
                      alt="Company logo preview"
                      className="h-16 object-contain"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <FaUpload className="mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Upload Company Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logo')}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  {formData.companyLogo && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, companyLogo: '' })}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Amazon, Google, Microsoft, etc."
                />
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sharmila Dokala"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role / Course
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Frontend Development Student"
                />
              </div>

              {/* Progress */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress (Optional)
                </label>
                <input
                  type="text"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="58% Complete"
                />
              </div>

              {/* Quote */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Testimonial Quote *
                </label>
                <textarea
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mentneo's frontend development course has been amazing..."
                  required
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5 stars)
                </label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Star' : 'Stars'}
                    </option>
                  ))}
                </select>
                <div className="flex text-yellow-400 mt-2">
                  {Array.from({ length: parseInt(formData.rating) || 5 }).map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
              </div>

              {/* Priority & Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority (higher = shows first)
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Featured (top section)</span>
                  </label>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaSave className="mr-2" />
                  {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Testimonials List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Testimonials</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading testimonials...</div>
          ) : testimonials.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No testimonials found. Create your first testimonial!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 flex items-start space-x-4">
                      <img
                        src={testimonial.imageUrl || `https://ui-avatars.com/api/?name=${testimonial.name?.replace(' ', '+')}&background=0062ff&color=fff`}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {testimonial.name}
                          </h3>
                          {testimonial.featured && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              Featured
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            testimonial.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {testimonial.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Priority: {testimonial.priority || 1}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{testimonial.role}</p>
                        {testimonial.progress && (
                          <p className="text-xs text-indigo-600 font-medium mb-2">{testimonial.progress}</p>
                        )}
                        <p className="text-gray-700 mb-3 italic">"{testimonial.quote}"</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex text-yellow-400 text-sm">
                            {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                              <FaStar key={i} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            ({testimonial.rating || 5}/5)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(testimonial)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTrash />
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

export default AdminTestimonials;
