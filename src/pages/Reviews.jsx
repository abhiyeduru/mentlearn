import React, { useState, useEffect } from 'react';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ⭐ All Student Reviews
          </h1>
          <p className="text-xl text-gray-600">
            Real feedback from our amazing students
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">
              No reviews yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
                {/* Star Rating */}
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-2xl">
                      {i < (review.rating || 5) ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 text-lg mb-6 italic leading-relaxed">
                  "{review.text}"
                </p>

                {/* Student Info - ONLY DYNAMIC CONTENT */}
                <div className="border-t pt-4">
                  <p className="font-bold text-gray-900 text-lg">
                    {review.studentName || 'Student'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {review.position || review.courseName || 'MentLearn Graduate'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total Count */}
        <div className="text-center mt-12 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <p className="text-blue-900 text-lg">
            <strong>Total Reviews:</strong> {reviews.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
