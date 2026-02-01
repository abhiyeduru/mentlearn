import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userRole } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reviews');
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page min-h-screen bg-white">
      {/* ...existing sections... */}

      {/* REVIEWS SECTION - COMPLETELY DYNAMIC */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ⭐ Student Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our students about their learning journey
            </p>
            
            {userRole === 'admin' && (
              <div className="mt-6">
                <button
                  onClick={() => navigate('/admin/reviews')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
                >
                  📋 Manage Reviews
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-lg">
                No reviews available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review, idx) => (
                <div 
                  key={idx} 
                  className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  {/* Star Rating */}
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-2xl">
                        {i < (review.rating || 5) ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{review.text}"
                  </p>

                  {/* Student Info - DYNAMIC ONLY */}
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
        </div>
      </section>

      {/* ...existing sections... */}
    </div>
  );
};

export default LandingPage;