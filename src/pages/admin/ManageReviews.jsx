import React, { useState, useEffect } from 'react';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    position: '',
    courseName: '',
    text: '',
    rating: 5,
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      position: '',
      courseName: '',
      text: '',
      rating: 5,
    });
  };

  const handleAddReview = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        resetForm();
        setShowForm(false);
        fetchReviews();
        alert('✅ Review added successfully!');
      } else {
        alert('❌ Error adding review');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      alert('❌ Error adding review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Delete this review?')) {
      try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchReviews();
          alert('✅ Review deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('❌ Error deleting review');
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📝 Manage Reviews</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
        >
          {showForm ? '✕ Cancel' : '+ Add Review'}
        </button>
      </div>

      {/* Add Review Form */}
      {showForm && (
        <div className="bg-white p-8 rounded-lg shadow mb-8 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold mb-6">Add New Review</h2>
          <form onSubmit={handleAddReview} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Student Name *</label>
                <input
                  type="text"
                  name="studentName"
                  placeholder="e.g., Sharmila Dokala"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Position/Role</label>
                <input
                  type="text"
                  name="position"
                  placeholder="e.g., SDE at Amazon"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Course Name</label>
              <input
                type="text"
                name="courseName"
                placeholder="e.g., Full Stack Development"
                value={formData.courseName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Review Text *</label>
              <textarea
                name="text"
                placeholder="Write the review..."
                value={formData.text}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Rating</label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                <option value="3">⭐⭐⭐ 3 Stars</option>
                <option value="2">⭐⭐ 2 Stars</option>
                <option value="1">⭐ 1 Star</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition"
            >
              Add Review
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <p className="text-gray-600 text-lg">No reviews yet</p>
          </div>
        ) : (
          reviews.map((review, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-yellow-400">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Star Rating */}
                  <div className="mb-3 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xl">
                        {i < review.rating ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 mb-4 text-lg italic">
                    "{review.text}"
                  </p>

                  {/* Student Info */}
                  <div className="border-t pt-3">
                    <p className="font-bold text-gray-900 text-lg">
                      {review.studentName}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {review.position || review.courseName || 'Student'}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteReview(idx)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-4 font-semibold transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <p className="text-blue-900">
          <strong>Total Reviews:</strong> {reviews.length}
        </p>
      </div>
    </div>
  );
};

export default ManageReviews;
