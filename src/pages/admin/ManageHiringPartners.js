import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, cloudinaryConfig } from '../../firebase/firebase.js';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FaPlus, FaTrash, FaSave, FaImage, FaEye, FaEyeSlash, FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function ManageHiringPartners() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partners, setPartners] = useState([]);
  const [editingPartner, setEditingPartner] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    website: '',
    active: true,
    order: 0
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const partnersSnap = await getDocs(collection(db, 'hiringPartners'));
      const partnersData = partnersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      partnersData.sort((a, b) => (a.order || 0) - (b.order || 0));
      setPartners(partnersData);
    } catch (err) {
      console.error('Error loading partners:', err);
      setError('Failed to load hiring partners');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setLogoFile(file);
        const preview = URL.createObjectURL(file);
        setLogoPreview(preview);
        setError('');
      } else {
        setError('Please select a valid image file (PNG, JPG, SVG, WEBP)');
        e.target.value = '';
      }
    }
  };

  const uploadLogoToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let logoUrl = formData.logoUrl;

      // Upload logo if a new file is selected
      if (logoFile) {
        setUploadProgress(10);
        logoUrl = await uploadLogoToCloudinary(logoFile);
        setUploadProgress(100);
      }

      if (!logoUrl) {
        setError('Please upload a logo');
        setSaving(false);
        return;
      }

      const dataToSave = {
        name: formData.name,
        logoUrl,
        website: formData.website || '',
        active: formData.active,
        order: parseInt(formData.order) || 0,
        updatedAt: new Date().toISOString()
      };

      if (editingPartner) {
        // Update existing partner
        const docRef = doc(db, 'hiringPartners', editingPartner.id);
        await updateDoc(docRef, dataToSave);
        setSuccess('Partner updated successfully!');
      } else {
        // Add new partner
        await addDoc(collection(db, 'hiringPartners'), {
          ...dataToSave,
          createdAt: new Date().toISOString()
        });
        setSuccess('Partner added successfully!');
      }

      setLogoFile(null);
      setLogoPreview('');
      setUploadProgress(0);
      setShowForm(false);
      setEditingPartner(null);
      setFormData({
        name: '',
        logoUrl: '',
        website: '',
        active: true,
        order: 0
      });
      loadPartners();
    } catch (err) {
      console.error('Error saving:', err);
      setError('Failed to save partner. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      logoUrl: partner.logoUrl,
      website: partner.website || '',
      active: partner.active !== false,
      order: partner.order || 0
    });
    setLogoPreview(partner.logoUrl);
    setShowForm(true);
  };

  const handleDelete = async (partnerId) => {
    if (!window.confirm('Are you sure you want to delete this hiring partner?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'hiringPartners', partnerId));
      setSuccess('Partner deleted successfully!');
      loadPartners();
    } catch (err) {
      console.error('Error deleting:', err);
      setError('Failed to delete partner');
    }
  };

  const toggleActive = async (partner) => {
    try {
      const docRef = doc(db, 'hiringPartners', partner.id);
      await updateDoc(docRef, {
        active: !partner.active,
        updatedAt: new Date().toISOString()
      });
      loadPartners();
    } catch (err) {
      console.error('Error toggling active:', err);
      setError('Failed to update partner status');
    }
  };

  const movePartner = async (partner, direction) => {
    const currentIndex = partners.findIndex(p => p.id === partner.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === partners.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const otherPartner = partners[newIndex];

    try {
      await updateDoc(doc(db, 'hiringPartners', partner.id), {
        order: otherPartner.order,
        updatedAt: new Date().toISOString()
      });
      await updateDoc(doc(db, 'hiringPartners', otherPartner.id), {
        order: partner.order,
        updatedAt: new Date().toISOString()
      });
      loadPartners();
    } catch (err) {
      console.error('Error reordering:', err);
      setError('Failed to reorder partners');
    }
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingPartner(null);
    setFormData({
      name: '',
      logoUrl: '',
      website: '',
      active: true,
      order: 0
    });
    setLogoFile(null);
    setLogoPreview('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Hiring Partners</h1>
          <p className="text-gray-600">
            Upload and manage company logos for the hiring partners marquee section
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Add New Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaPlus /> Add New Partner
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingPartner ? 'Edit Partner' : 'Add New Partner'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Google, Microsoft, Amazon"
                  required
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaImage className="inline mr-2" />
                  Company Logo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {logoPreview && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">Logo Preview:</p>
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-12 max-w-[120px] object-contain"
                    />
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Recommended: PNG or SVG with transparent background
                </p>
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://company.com"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Lower numbers appear first
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Active (Show on landing page)
                </label>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FaSave />
                  {saving ? 'Saving...' : editingPartner ? 'Update Partner' : 'Add Partner'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Partners List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Hiring Partners ({partners.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hiring partners yet. Add your first partner!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {partners.map((partner, index) => (
                <div key={partner.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      {/* Logo */}
                      <div className="flex-shrink-0">
                        <img
                          src={partner.logoUrl}
                          alt={partner.name}
                          className="h-12 max-w-[120px] object-contain"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
                        {partner.website && (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {partner.website}
                          </a>
                        )}
                        <p className="text-sm text-gray-500 mt-1">Order: {partner.order || 0}</p>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {partner.active !== false ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Reorder Buttons */}
                      <button
                        onClick={() => movePartner(partner, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        onClick={() => movePartner(partner, 'down')}
                        disabled={index === partners.length - 1}
                        className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <FaArrowDown />
                      </button>

                      {/* Toggle Active */}
                      <button
                        onClick={() => toggleActive(partner)}
                        className="p-2 text-gray-600 hover:text-blue-600"
                        title={partner.active ? 'Hide' : 'Show'}
                      >
                        {partner.active !== false ? <FaEye /> : <FaEyeSlash />}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(partner)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(partner.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                        title="Delete"
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
}
