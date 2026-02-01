import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase.js';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaLink, FaPhone, FaEnvelope } from 'react-icons/fa';

const AdminFooter = () => {
  const [footerSections, setFooterSections] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    copyright: ''
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    order: 0,
    links: [{ name: '', url: '' }]
  });

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      setLoading(true);
      
      // Fetch footer sections
      const sectionsQuery = query(collection(db, 'footerSections'), orderBy('order', 'asc'));
      const sectionsSnapshot = await getDocs(sectionsQuery);
      const sections = sectionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFooterSections(sections);

      // Fetch contact info
      const contactSnapshot = await getDocs(collection(db, 'footerContact'));
      if (!contactSnapshot.empty) {
        setContactInfo(contactSnapshot.docs[0].data());
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching footer data:', error);
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    setFormData({
      ...formData,
      links: [...formData.links, { name: '', url: '' }]
    });
  };

  const handleRemoveLink = (index) => {
    const newLinks = formData.links.filter((_, i) => i !== index);
    setFormData({ ...formData, links: newLinks });
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...formData.links];
    newLinks[index][field] = value;
    setFormData({ ...formData, links: newLinks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        order: parseInt(formData.order),
        updatedAt: new Date().toISOString()
      };

      if (editingSection) {
        await updateDoc(doc(db, 'footerSections', editingSection.id), dataToSave);
      } else {
        await addDoc(collection(db, 'footerSections'), {
          ...dataToSave,
          createdAt: new Date().toISOString()
        });
      }

      setShowModal(false);
      setEditingSection(null);
      setFormData({ title: '', order: 0, links: [{ name: '', url: '' }] });
      fetchFooterData();
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Error saving section');
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      title: section.title,
      order: section.order,
      links: section.links || [{ name: '', url: '' }]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await deleteDoc(doc(db, 'footerSections', id));
        fetchFooterData();
      } catch (error) {
        console.error('Error deleting section:', error);
        alert('Error deleting section');
      }
    }
  };

  const handleContactUpdate = async () => {
    try {
      const contactSnapshot = await getDocs(collection(db, 'footerContact'));
      if (contactSnapshot.empty) {
        await addDoc(collection(db, 'footerContact'), contactInfo);
      } else {
        await updateDoc(doc(db, 'footerContact', contactSnapshot.docs[0].id), contactInfo);
      }
      alert('Contact information updated successfully!');
    } catch (error) {
      console.error('Error updating contact info:', error);
      alert('Error updating contact information');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Footer Management</h1>
          <p className="mt-2 text-gray-600">Manage footer sections and contact information</p>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2" />
                Phone Number
              </label>
              <input
                type="text"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="08045579576"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="contact@mentneo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copyright Text
              </label>
              <input
                type="text"
                value={contactInfo.copyright}
                onChange={(e) => setContactInfo({ ...contactInfo, copyright: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="© 2024 InterviewBit Technologies"
              />
            </div>
          </div>
          <button
            onClick={handleContactUpdate}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaSave className="inline mr-2" />
            Save Contact Info
          </button>
        </div>

        {/* Footer Sections */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Footer Sections</h2>
            <button
              onClick={() => {
                setEditingSection(null);
                setFormData({ title: '', order: 0, links: [{ name: '', url: '' }] });
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="inline mr-2" />
              Add Section
            </button>
          </div>

          {/* Sections List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {footerSections.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(section)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(section.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-2">Order: {section.order}</div>
                <ul className="space-y-1">
                  {section.links?.map((link, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start">
                      <FaLink className="mt-1 mr-2 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 break-words">
                        <div className="font-medium">{link.name}</div>
                        <div className="text-xs text-gray-400 truncate">{link.url}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingSection ? 'Edit Section' : 'Add Section'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Section Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Trending Courses"
                    required
                  />
                </div>

                {/* Order */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                {/* Links */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Links
                    </label>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <FaPlus className="inline mr-1" />
                      Add Link
                    </button>
                  </div>
                  
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => handleLinkChange(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Link Name"
                        required
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="URL or Path"
                        required
                      />
                      {formData.links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaSave className="inline mr-2" />
                    {editingSection ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFooter;
