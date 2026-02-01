import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaBook, FaStar, FaRupeeSign, FaClock, FaChartLine,
  FaPlayCircle, FaCertificate, FaGraduationCap, FaCheck,
  FaUndo, FaArrowLeft, FaUser, FaCalendar
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import MenteoLogo from '../components/MenteoLogo';
import ChatUsButton from '../components/ChatUsButton';
import MenteoLoader from '../components/MenteoLoader';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (courseSnap.exists()) {
          setCourse({ id: courseSnap.id, ...courseSnap.data() });
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const handleEnrollClick = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
    } else {
      navigate(`/courses/${courseId}/checkout`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <MenteoLoader />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <MenteoLogo size="small" />
              <span className="text-2xl font-bold text-gray-900">Mentneo</span>
            </Link>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {error || 'Course Not Found'}
          </h1>
          <p className="text-gray-600 mb-8">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            to="/courses" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            <FaArrowLeft className="mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const isFree = !course.price || course.price === 0 || course.price === '0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <MenteoLogo size="small" />
              <span className="text-2xl font-bold text-gray-900">Mentneo</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <FaArrowLeft />
                Back
              </button>
              {!currentUser && (
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-all"
                >
                  LOGIN
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Course Image */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Course Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                {course.featured && (
                  <span className="px-4 py-1.5 rounded-full bg-red-500 text-white text-sm font-bold uppercase">
                    Featured
                  </span>
                )}
                {course.isNew && (
                  <span className="px-4 py-1.5 rounded-full bg-green-500 text-white text-sm font-bold uppercase">
                    New
                  </span>
                )}
                {course.category && (
                  <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold uppercase">
                    {course.category}
                  </span>
                )}
                {course.level && (
                  <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold uppercase">
                    {course.level}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {course.description}
              </p>

              {/* Rating */}
              {course.rating && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400 text-lg" />
                    <span className="font-bold text-2xl">{course.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-blue-100">
                    ({course.reviews || course.studentsEnrolled || 0}+ reviews)
                  </span>
                </div>
              )}

              {/* Instructor & Created Date */}
              <div className="flex flex-wrap gap-6 mb-8 text-blue-100">
                {course.creatorName && (
                  <div className="flex items-center gap-2">
                    <FaUser className="text-lg" />
                    <span>By {course.creatorName}</span>
                  </div>
                )}
                {course.createdAt && (
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-lg" />
                    <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Price & CTA */}
              <div className="flex flex-wrap items-center gap-6">
                {isFree ? (
                  <div className="text-5xl font-bold text-green-400">FREE</div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <div className="flex items-center text-5xl font-bold">
                      <FaRupeeSign className="text-4xl" />
                      {course.price}
                    </div>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <span className="text-2xl text-blue-200 line-through">
                        ₹{course.originalPrice}
                      </span>
                    )}
                  </div>
                )}
                <button
                  onClick={handleEnrollClick}
                  className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-xl hover:bg-blue-50 hover:scale-105 transition-all shadow-xl"
                >
                  {isFree ? 'Enroll Now - Free' : 'Enroll Now'}
                </button>
              </div>
            </motion.div>

            {/* Course Thumbnail */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative h-96 bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                {course.thumbnailUrl ? (
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FaGraduationCap className="text-white/30 text-9xl" />
                  </div>
                )}
                {course.previewVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all cursor-pointer group">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-6 group-hover:scale-110 transition-all">
                      <FaPlayCircle className="text-blue-600 text-6xl" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Course Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {course.duration && (
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all">
              <FaClock className="text-blue-600 text-4xl mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1 font-medium">Duration</p>
              <p className="text-2xl font-bold text-gray-900">{course.duration}</p>
            </div>
          )}
          {course.lessons && (
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all">
              <FaBook className="text-purple-600 text-4xl mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1 font-medium">Lessons</p>
              <p className="text-2xl font-bold text-gray-900">{course.lessons}</p>
            </div>
          )}
          <div className="bg-white border-2 border-green-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all">
            <FaCertificate className="text-green-600 text-4xl mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1 font-medium">Certificate</p>
            <p className="text-xl font-bold text-gray-900">Included</p>
          </div>
          <div className="bg-white border-2 border-yellow-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all">
            <FaUndo className="text-yellow-600 text-4xl mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1 font-medium">Refund Policy</p>
            <p className="text-xl font-bold text-gray-900">30 Days</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* About This Course */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-md p-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FaBook className="text-blue-500" />
                About This Course
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {course.description || 'Comprehensive course designed to help you master essential skills through hands-on projects and expert guidance.'}
              </p>
            </motion.div>

            {/* What You'll Learn */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-2xl shadow-md p-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.learningOutcomes.map((outcome, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 hover:bg-green-100 transition-all"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                        <FaCheck className="text-white text-sm" />
                      </div>
                      <span className="text-gray-800 leading-relaxed font-medium">{outcome}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Course Curriculum */}
            {course.modules && course.modules.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white rounded-2xl shadow-md p-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
                <p className="text-gray-600 mb-6">
                  {course.modules.length} modules • {course.modules.reduce((acc, m) => acc + (m.topics?.length || 0), 0)} lessons
                </p>
                <div className="space-y-4">
                  {course.modules.map((module, index) => (
                    <div 
                      key={index}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-900 mb-2">{module.title}</h3>
                          {module.description && (
                            <p className="text-gray-600 mb-3">{module.description}</p>
                          )}
                          {module.topics && module.topics.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <FaPlayCircle className="text-blue-500" />
                              <span>{module.topics.length} lessons</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Show topics/lessons */}
                      {module.topics && module.topics.length > 0 && (
                        <div className="mt-4 pl-14 space-y-2">
                          {module.topics.slice(0, 3).map((topic, topicIndex) => (
                            <div key={topicIndex} className="flex items-center gap-2 text-gray-700">
                              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                              <span className="text-sm">{topic.title}</span>
                            </div>
                          ))}
                          {module.topics.length > 3 && (
                            <p className="text-sm text-blue-600 font-medium">
                              +{module.topics.length - 3} more lessons
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="sticky top-24"
            >
              {/* Enrollment Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Start?</h3>
                
                {isFree ? (
                  <div className="mb-6">
                    <div className="text-5xl font-bold text-green-600 mb-2">FREE</div>
                    <p className="text-gray-600">Start learning today at no cost</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="flex items-center text-5xl font-bold text-gray-900 mb-2">
                      <FaRupeeSign className="text-4xl" />
                      {course.price}
                    </div>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl text-gray-400 line-through">
                          ₹{course.originalPrice}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-bold rounded">
                          {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleEnrollClick}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transition-all mb-4"
                >
                  {isFree ? 'Enroll Now - Free' : 'Enroll Now'}
                </button>

                <p className="text-center text-sm text-gray-600 mb-4">
                  30-day money-back guarantee
                </p>

                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaCheck className="text-green-500 flex-shrink-0" />
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaCheck className="text-green-500 flex-shrink-0" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaCheck className="text-green-500 flex-shrink-0" />
                    <span>24/7 support access</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaCheck className="text-green-500 flex-shrink-0" />
                    <span>Mobile & desktop access</span>
                  </div>
                </div>
              </div>

              {/* Instructor Card */}
              {(course.instructor || course.creatorName) && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Your Instructor</h3>
                  <p className="text-lg font-semibold text-gray-800">
                    {course.instructor || course.creatorName}
                  </p>
                  {course.instructorBio && (
                    <p className="text-gray-600 mt-2">{course.instructorBio}</p>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <ChatUsButton />
    </div>
  );
};

export default CourseDetailsPage;
