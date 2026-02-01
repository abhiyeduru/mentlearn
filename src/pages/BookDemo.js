import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaCheck, FaGraduationCap, FaCode, FaUsers } from 'react-icons/fa';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import ChatUsButton from '../components/ChatUsButton.js';

const BookDemo = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    college: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Phone number should be 10 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save to Firestore
      await addDoc(collection(db, "demoBookings"), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset form data
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        college: ''
      });
      
    } catch (error) {
      console.error("Error booking demo:", error);
      setIsSubmitting(false);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
      {/* Decorative wave/blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute -bottom-1 left-0 w-full h-48" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,128C672,128,768,160,864,176C960,192,1056,192,1152,176C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col">
        {/* Back link */}
        <div className="mb-8">
          <Link to="/" className="flex items-center text-white hover:text-blue-100 transition-colors font-semibold">
            <FaArrowLeft className="mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {!submitSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 py-8"
            >
              {/* Left side - Heading and feature boxes */}
              <div className="w-full lg:w-1/2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-center lg:text-left"
                >
                  <p className="text-blue-100 text-sm font-semibold mb-3 inline-block bg-white/20 px-3 py-1 rounded-full">
                    Industry ready curriculum
                  </p>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    Learn like top students and achieve high-paid software jobs
                  </h1>
                  
                  <p className="text-blue-50 text-lg mb-8 max-w-lg">
                    Mentneo students are carving a name for themselves in the IT industry. Learn directly from industry experts.
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      { icon: <FaGraduationCap className="text-2xl" />, title: "Start your journey with no coding experience", desc: "" },
                      { icon: <FaCode className="text-2xl" />, title: "Get guidance from experts at top tech companies", desc: "" },
                      { icon: <FaUsers className="text-2xl" />, title: "Create projects that lead to amazing internship", desc: "" }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-start gap-4"
                      >
                        <div className="text-blue-200 flex-shrink-0">{item.icon}</div>
                        <div className="text-left">
                          <h3 className="font-semibold text-white">{item.title}</h3>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
              
              {/* Right side - Form */}
              <div className="w-full lg:w-1/2 max-w-md">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="relative"
                >
                  {/* White card with shadow */}
                  <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden p-8">
                    <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Register for <span className="text-orange-500">Free</span></h2>
                    <p className="text-center text-gray-600 text-sm mb-6">Live interactive Session</p>
                    
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        {/* Full Name Field */}
                        <div>
                          <label htmlFor="fullName" className="block text-sm font-semibold text-gray-800 mb-2">
                            Name <span className="text-red-500">*Required</span>
                          </label>
                          <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            className={`appearance-none block w-full px-3 py-2.5 border ${
                              errors.fullName ? 'border-red-500' : 'border-gray-300'
                            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900`}
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                          />
                          {errors.fullName && (
                            <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                          )}
                        </div>
                        
                        {/* Email Field */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                            Email <span className="text-red-500">*Required</span>
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className={`appearance-none block w-full px-3 py-2.5 border ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900`}
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                          {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                          )}
                        </div>
                        
                        {/* Phone Number Field */}
                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-800 mb-2">
                            Phone Number <span className="text-red-500">*Required</span>
                          </label>
                          <div className="flex rounded-md shadow-sm">
                            <select className="px-2 py-2.5 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-sm font-medium focus:outline-none">
                              <option>IN +91</option>
                            </select>
                            <input
                              id="phoneNumber"
                              name="phoneNumber"
                              type="tel"
                              required
                              className={`appearance-none block w-full px-3 py-2.5 border ${
                                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                              } rounded-r-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900`}
                              placeholder="Enter Mobile Number"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                            />
                          </div>
                          {errors.phoneNumber && (
                            <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
                          )}
                        </div>
                        
                        {/* College Field (Optional) */}
                        <div>
                          <label htmlFor="college" className="block text-sm font-semibold text-gray-800 mb-2">
                            Currently Studying
                          </label>
                          <select
                            id="college"
                            name="college"
                            className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                            value={formData.college}
                            onChange={handleInputChange}
                          >
                            <option value="">Select your current education status</option>
                            <option value="High School">High School</option>
                            <option value="College 1st Year">College 1st Year</option>
                            <option value="College 2nd Year">College 2nd Year</option>
                            <option value="College 3rd Year">College 3rd Year</option>
                            <option value="College 4th Year">College 4th Year</option>
                            <option value="Graduated">Graduated</option>
                            <option value="Working Professional">Working Professional</option>
                          </select>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              'Register for Free'
                            )}
                          </button>
                          
                          {errors.submit && (
                            <p className="mt-2 text-sm text-center text-red-500">{errors.submit}</p>
                          )}
                        </div>
                      </div>
                    </form>
                    
                    <div className="mt-4 text-center">
                      <p className="text-gray-600 text-xs">
                        By proceeding further, I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto lg:w-1/2 py-8"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.3 
                  }}
                >
                  <FaCheck className="text-green-500 text-3xl" />
                </motion.div>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-white">
                You're All Set!
              </h2>
              
              <p className="text-lg text-blue-100 mb-8">
                Our team will contact you soon to confirm your booking and share the next steps.
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8 w-full">
                <h3 className="font-bold text-lg mb-4 text-white">What happens next?</h3>
                <ol className="space-y-3 text-left">
                  <li className="flex items-start">
                    <span className="bg-blue-300 text-blue-900 rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">1</span>
                    <span className="text-blue-50">Our counselor will call you within 24 hours to confirm your booking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-300 text-blue-900 rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">2</span>
                    <span className="text-blue-50">We'll confirm your seat and share the joining instructions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-300 text-blue-900 rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">3</span>
                    <span className="text-blue-50">Start learning with your cohort on the scheduled date</span>
                  </li>
                </ol>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/" 
                  className="px-6 py-3 bg-white/20 border border-white rounded-md text-white font-medium hover:bg-white/30 transition"
                >
                  Back to Home
                </Link>
                <Link 
                  to="/courses" 
                  className="px-6 py-3 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition"
                >
                  Explore Courses
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Chat Button */}
      <ChatUsButton label="Chat with us" variant="whatsapp" />
    </div>
  );
};

export default BookDemo;
