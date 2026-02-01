import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaBook, FaUsers, FaStar, FaRupeeSign, FaClock, FaChartLine,
  FaPlayCircle, FaCertificate, FaGraduationCap, FaFilter,
  FaSearch, FaTimes, FaCheck, FaUndo
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import MenteoLogo from '../components/MenteoLogo';
import ChatUsButton from '../components/ChatUsButton';
import MenteoLoader from '../components/MenteoLoader';

const PublicCoursesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all',
    priceType: 'all',
    duration: 'all',
    sort: 'popular'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesRef = collection(db, 'courses');
      const querySnapshot = await getDocs(coursesRef);
      
      const coursesList = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(course => course.published !== false); // Only show published courses
      
      setCourses(coursesList);
      setLoading(false);
      
      // Analytics: view_course_list
      console.log('📊 Analytics: view_course_list', { count: coursesList.length });
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
    
    // Analytics: click_course_card
    console.log('📊 Analytics: click_course_card', { 
      courseId: course.id, 
      courseName: course.title 
    });
  };

  const handleBuyNow = (course) => {
    if (!currentUser) {
      // Redirect to signup with course info
      navigate('/signup', { state: { returnTo: `/courses/${course.id}/checkout` } });
      return;
    }
    
    // Analytics: start_payment
    console.log('📊 Analytics: start_payment', { 
      courseId: course.id, 
      courseName: course.title,
      amount: course.price 
    });
    
    // Navigate directly to checkout page
    navigate(`/courses/${course.id}/checkout`);
  };

  // Apply filters and sorting
  const filteredCourses = courses
    .filter(course => {
      // Search filter
      const matchesSearch = 
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = 
        filters.category === 'all' || 
        course.category?.toLowerCase() === filters.category.toLowerCase();
      
      // Level filter
      const matchesLevel = 
        filters.level === 'all' || 
        course.level?.toLowerCase() === filters.level.toLowerCase();
      
      // Price type filter
      const matchesPriceType = 
        filters.priceType === 'all' || 
        (filters.priceType === 'free' && (!course.price || course.price === 0)) ||
        (filters.priceType === 'paid' && course.price > 0);
      
      // Duration filter
      const matchesDuration = filters.duration === 'all' || checkDuration(course, filters.duration);
      
      return matchesSearch && matchesCategory && matchesLevel && matchesPriceType && matchesDuration;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'new':
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        case 'popular':
        default:
          return (b.enrollments || 0) - (a.enrollments || 0);
      }
    });

  const checkDuration = (course, durationType) => {
    const hours = course.duration || 0;
    switch (durationType) {
      case 'short': return hours <= 10;
      case 'medium': return hours > 10 && hours <= 30;
      case 'long': return hours > 30;
      default: return true;
    }
  };

  const categories = ['all', ...new Set(courses.map(c => c.category).filter(Boolean))];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Navbar */}
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <MenteoLogo size="medium" showText />
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {currentUser ? (
                  <Link 
                    to="/student/student-dashboard" 
                    className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all"
                  >
                    My Dashboard
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all"
                    >
                      Log In
                    </Link>
                    <Link 
                      to="/signup" 
                      className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-6 rounded-lg shadow-lg transition-all"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-extrabold mb-6 text-white"
              >
                Explore Premium Courses
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed"
              >
                Master in-demand tech skills with industry experts. Build portfolio-grade projects and accelerate your career.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-4"
              >
                <button
                  onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl text-lg shadow-xl transition-all inline-flex items-center"
                >
                  View Courses
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div id="courses-section" className="bg-white shadow-md sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-3 items-center">
              <FaFilter className="text-gray-600" />
              
              {/* Category */}
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium transition-all hover:border-gray-300"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              {/* Level */}
              <select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium transition-all hover:border-gray-300"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>

              {/* Price Type */}
              <select
                value={filters.priceType}
                onChange={(e) => setFilters({ ...filters, priceType: e.target.value })}
                className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium transition-all hover:border-gray-300"
              >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>

              {/* Duration */}
              <select
                value={filters.duration}
                onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium transition-all hover:border-gray-300"
              >
                <option value="all">All Durations</option>
                <option value="short">Short (≤10 hrs)</option>
                <option value="medium">Medium (11-30 hrs)</option>
                <option value="long">Long (30+ hrs)</option>
              </select>

              {/* Sort */}
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium transition-all ml-auto hover:border-gray-300"
              >
                <option value="popular">Popular</option>
                <option value="new">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>

            {/* Active Filters Count */}
            {(filters.category !== 'all' || filters.level !== 'all' || filters.priceType !== 'all' || filters.duration !== 'all' || searchQuery) && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 font-medium">
                  Showing {filteredCourses.length} of {courses.length} courses
                </p>
                <button
                  onClick={() => {
                    setFilters({ category: 'all', level: 'all', priceType: 'all', duration: 'all', sort: 'popular' });
                    setSearchQuery('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all border border-blue-200"
                >
                  <FaTimes className="text-xs" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <ChatUsButton label="Chat with us" variant="whatsapp" />
          {loading ? (
            <MenteoLoader message="Loading courses..." />
          ) : filteredCourses.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-3xl border-2 border-gray-200 p-12 shadow-lg"
            >
              <FaBook className="mx-auto text-6xl text-gray-300 mb-6" />
              <h3 className="text-3xl font-bold text-gray-900 mb-3">No courses found</h3>
              <p className="text-gray-600 mb-8 text-lg">Try adjusting your filters or search query</p>
              <button
                onClick={() => {
                  setFilters({ category: 'all', level: 'all', priceType: 'all', duration: 'all', sort: 'popular' });
                  setSearchQuery('');
                }}
                className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-3 px-8 rounded-xl transition-all shadow-lg"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, index) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onBuyClick={handleBuyNow}
                  onCardClick={handleCourseClick}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Course Detail Modal */}
      <AnimatePresence>
        {showModal && selectedCourse && (
          <CourseDetailModal 
            course={selectedCourse} 
            onClose={() => setShowModal(false)}
            onBuyClick={handleBuyNow}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course, onBuyClick, onCardClick, index }) => {
  const isFree = !course.price || course.price === 0;
  const hasDiscount = course.originalPrice && course.originalPrice > course.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group cursor-pointer"
      onClick={() => onCardClick(course)}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-200 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative h-56 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
          {course.thumbnailUrl || course.thumbnail ? (
            <img 
              src={course.thumbnailUrl || course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FaGraduationCap className="text-blue-300 text-6xl" />
            </div>
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              className="opacity-0 group-hover:opacity-100 transition-all"
            >
              <FaPlayCircle className="text-white text-5xl drop-shadow-2xl" />
            </motion.div>
          </div>
          
          {/* Tags */}
          <div className="absolute top-4 left-4 flex gap-2">
            {course.level && (
              <span className="bg-white px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 capitalize shadow-md">
                {course.level}
              </span>
            )}
            {isFree && (
              <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                FREE
              </span>
            )}
            {hasDiscount && (
              <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                SALE
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">
            {course.description || 'Master this comprehensive course with real-world projects'}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-5 pb-5 border-b border-gray-200">
            {course.duration && (
              <div className="flex items-center gap-2">
                <FaClock className="text-blue-500" />
                <span className="font-medium">{course.duration}h</span>
              </div>
            )}
            {course.rating && (
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                <span className="font-medium">{course.rating}</span>
              </div>
            )}
            {course.enrollments && (
              <div className="flex items-center gap-2">
                <FaUsers className="text-purple-500" />
                <span className="font-medium">{course.enrollments}</span>
              </div>
            )}
          </div>

          {/* Price & CTA */}
          <div className="flex items-end justify-between gap-4 mt-auto">
            <div>
              {isFree ? (
                <span className="text-3xl font-bold text-green-600">FREE</span>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{course.price}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{course.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <FaCertificate className="text-xs text-blue-500" />
                Certificate included
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuyClick(course);
              }}
              className={`${
                isFree 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap`}
            >
              {isFree ? 'Enroll' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Course Detail Modal Component
const CourseDetailModal = ({ course, onClose, onBuyClick }) => {
  const isFree = !course.price || course.price === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex items-center justify-between z-10 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FaGraduationCap className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{course.title}</h2>
              {course.category && (
                <p className="text-sm text-blue-100 capitalize">{course.category}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-8">
            {/* Preview Video/Image */}
            <div className="mb-8 relative h-80 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl overflow-hidden shadow-lg">
              {course.thumbnailUrl || course.thumbnail ? (
                <img 
                  src={course.thumbnailUrl || course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FaGraduationCap className="text-blue-300 text-9xl" />
                </div>
              )}
              {course.previewVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all cursor-pointer group">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-6"
                  >
                    <FaPlayCircle className="text-blue-600 text-7xl group-hover:text-blue-700 transition-colors" />
                  </motion.div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaBook className="text-blue-500" />
                About This Course
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {course.description || 'Comprehensive course designed to help you master essential skills through hands-on projects and expert guidance.'}
              </p>
            </div>

            {/* What You'll Learn */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.learningOutcomes.map((outcome, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 hover:bg-green-100 transition-all"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                        <FaCheck className="text-white text-sm" />
                      </div>
                      <span className="text-gray-800 leading-relaxed font-medium">{outcome}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {course.duration && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 text-center hover:bg-blue-100 transition-all">
                  <FaClock className="text-blue-600 text-3xl mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1 font-medium">Duration</p>
                  <p className="text-xl font-bold text-gray-900">{course.duration}h</p>
                </div>
              )}
              {course.level && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 text-center hover:bg-purple-100 transition-all">
                  <FaChartLine className="text-purple-600 text-3xl mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1 font-medium">Level</p>
                  <p className="text-xl font-bold text-gray-900 capitalize">{course.level}</p>
                </div>
              )}
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center hover:bg-green-100 transition-all">
                <FaCertificate className="text-green-600 text-3xl mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1 font-medium">Certificate</p>
                <p className="text-xl font-bold text-gray-900">Included</p>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 text-center hover:bg-yellow-100 transition-all">
                <FaUndo className="text-yellow-600 text-3xl mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1 font-medium">Refund</p>
                <p className="text-xl font-bold text-gray-900">30 Days</p>
              </div>
            </div>

            {/* Syllabus */}
            {course.modules && course.modules.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Course Curriculum</h3>
                <div className="space-y-3">
                  {course.modules.map((module, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:bg-gray-100 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{module.title}</p>
                            {module.topics && (
                              <p className="text-sm text-gray-600 mt-1">{module.topics.length} lessons</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor */}
            {course.instructor && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Instructor</h3>
                <p className="text-gray-800 text-lg font-medium">{course.instructor}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-8 py-5 flex items-center justify-between shadow-2xl">
          <div>
            {isFree ? (
              <div>
                <span className="text-4xl font-bold text-green-600">FREE</span>
                <p className="text-xs text-gray-600 mt-1">Start learning today</p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 flex items-center">
                    <FaRupeeSign className="text-3xl" />
                    {course.price}
                  </span>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <span className="text-lg text-gray-400 line-through">
                      ₹{course.originalPrice}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">Certificate • 30-day refund</p>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              onClose();
              onBuyClick(course);
            }}
            className={`${
              isFree 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-bold py-4 px-10 rounded-xl text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2`}
          >
            {isFree ? (
              <>
                <FaCheck />
                Enroll for Free
              </>
            ) : (
              <>
                <FaRupeeSign />
                Buy Now
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PublicCoursesPage;
