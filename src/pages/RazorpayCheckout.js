import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase.js';
import { useAuth } from '../contexts/AuthContext';
import { FaRupeeSign, FaLock, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import MenteoLoader from '../components/MenteoLoader';

const RazorpayCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponStatus, setCouponStatus] = useState(null); // {valid, message}
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [finalPrice, setFinalPrice] = useState(null);
  const [discount, setDiscount] = useState(0);
  const gstRate = Number(process.env.REACT_APP_GST_RATE || 1.9);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      
      if (!courseDoc.exists()) {
        setError('Course not found');
        return;
      }
      
      const c = { id: courseDoc.id, ...courseDoc.data() };
      setCourse(c);
      setFinalPrice(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course details');
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }
    fetchCourse();
  }, [currentUser, courseId, fetchCourse, location.pathname, navigate]);

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      setCouponStatus({ valid: false, message: 'Enter a coupon code' });
      return;
    }
    if (!currentUser) {
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }
    try {
      setValidatingCoupon(true);
      setCouponStatus(null);
      const token = await auth.currentUser.getIdToken();
      const resp = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/razorpay/validate-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: course.id, couponCode: couponCode.toUpperCase() })
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.error || 'Failed to validate coupon');
      }
      if (data.valid) {
        setAppliedCoupon(couponCode.toUpperCase());
        setDiscount(Math.round(data.discount));
        setFinalPrice(data.finalPrice);
        setCouponStatus({ valid: true, message: 'Coupon applied' });
      } else {
        setAppliedCoupon(null);
        setDiscount(0);
        setFinalPrice(null);
        setCouponStatus({ valid: false, message: data.message || 'Invalid coupon' });
      }
    } catch (e) {
      console.error('Coupon validation error:', e);
      setCouponStatus({ valid: false, message: e.message || 'Failed to validate coupon' });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePayment = async () => {
    if (!currentUser) {
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }

    setProcessing(true);
    setError(null);

    // Analytics: start_payment
    console.log('📊 Analytics: start_payment', {
      userId: currentUser.uid,
      courseId: course.id,
      courseName: course.title,
      amount: course.price
    });

    try {
      // Get Firebase auth token
      const token = await auth.currentUser.getIdToken();

      // Create Razorpay order
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: course.id,
          couponCode: (appliedCoupon || couponCode || '').toUpperCase() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      console.log('✅ Order created:', data.orderId);
      if (data.courseDetails) {
        setFinalPrice(data.courseDetails.finalPrice);
        setDiscount(Math.round(data.courseDetails.discount || 0));
      }

      // Open Razorpay Checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'Mentlearn',
        description: `Course: ${course.title}`,
        image: '/logo192.png', // Your logo
        handler: async function (response) {
          await verifyPayment(response);
        },
        prefill: {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          contact: currentUser.phoneNumber || ''
        },
        theme: {
          color: '#3B82F6' // Blue-600
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            console.log('📊 Analytics: payment_cancelled', {
              userId: currentUser.uid,
              courseId: course.id
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);

      // Analytics: payment_failed
      console.log('📊 Analytics: payment_failed', {
        userId: currentUser.uid,
        courseId: course.id,
        reason: err.message
      });
    }
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      console.log('🔐 Verifying payment...');
      
      const token = await auth.currentUser.getIdToken();

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/razorpay/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentResponse)
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      console.log('✅ Payment verified successfully');

      // Analytics: payment_success
      console.log('📊 Analytics: payment_success', {
        userId: currentUser.uid,
        courseId: course.id,
        courseName: course.title,
        amount: course.price,
        orderId: paymentResponse.razorpay_order_id,
        paymentId: paymentResponse.razorpay_payment_id
      });

      // Redirect to success page
      navigate(`/payment/success?courseId=${course.id}&enrollmentId=${data.enrollmentId}`, {
        state: { 
          courseName: course.title,
          amount: course.price 
        }
      });

    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Payment verification failed');
      setProcessing(false);

      // Analytics: payment_failed
      console.log('📊 Analytics: payment_failed', {
        userId: currentUser.uid,
        courseId: course.id,
        reason: 'verification_failed'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MenteoLoader fullScreen message="Preparing your checkout..." />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTimes className="text-red-600 text-4xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Oops!</h2>
          <p className="text-gray-600 mb-8 text-lg">{error}</p>
          <button
            onClick={() => navigate('/courses')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg"
          >
            Back to Courses
          </button>
        </motion.div>
      </div>
    );
  }

  const isFree = !course?.price || course?.price === 0;
  const subtotal = course?.price || 0;
  const discountedPriceLocal = Math.max(0, (subtotal || 0) - (discount || 0));
  const gstLocal = isFree ? 0 : Math.round(discountedPriceLocal * (gstRate / 100));
  const payable = finalPrice ?? (isFree ? 0 : discountedPriceLocal + gstLocal);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Course
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <FaLock className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-extrabold text-white mb-2">Secure Checkout</h1>
                <p className="text-blue-100 text-lg">Complete your purchase securely with encrypted payment</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Course Details & Payment Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Course Details */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    Course Details
                  </h2>
                  <div className="flex gap-6">
                    {(course.thumbnailUrl || course.thumbnail) && (
                      <div className="flex-shrink-0">
                        <img 
                          src={course.thumbnailUrl || course.thumbnail} 
                          alt={course.title}
                          className="w-48 h-48 object-cover rounded-xl shadow-md border border-gray-200"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                        {course.description?.substring(0, 200)}...
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        {course.duration && (
                          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-blue-900 text-sm font-semibold">{course.duration} hours</span>
                          </div>
                        )}
                        {course.level && (
                          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-4 py-2 rounded-lg">
                            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                            <span className="text-purple-900 text-sm font-semibold capitalize">{course.level}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-green-900 text-sm font-semibold">Certificate</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* What's Included */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-5">What's Included</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: '∞', text: 'Lifetime access to course content', color: 'blue' },
                      { icon: '🎓', text: 'Certificate of completion', color: 'purple' },
                      { icon: '📚', text: 'All course materials & resources', color: 'indigo' },
                      { icon: '↩️', text: '30-day money-back guarantee', color: 'green' },
                      { icon: '👨‍🏫', text: 'Expert instructor support', color: 'orange' },
                      { icon: '💼', text: 'Real-world projects & assignments', color: 'pink' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-${item.color}-50 flex items-center justify-center border border-${item.color}-200`}>
                          <span className="text-xl">{item.icon}</span>
                        </div>
                        <span className="text-gray-700 text-sm font-medium leading-tight">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Coupon Code (only for paid courses) */}
                {!isFree && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Have a Coupon Code?</h2>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase().trim())}
                        className="flex-1 px-4 py-3 bg-white border-2 border-blue-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                      >
                        {validatingCoupon ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {couponStatus && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-3 text-sm font-semibold flex items-center gap-2 ${
                          couponStatus.valid ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        {couponStatus.valid ? <FaCheck /> : <FaTimes />}
                        {couponStatus.message}
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Right Column - Price Summary & CTA */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Price Summary */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700"
                  >
                    <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
                    <div className="space-y-4">
                      {!isFree && (
                        <div className="flex justify-between items-center text-gray-300">
                          <span className="text-sm">Subtotal</span>
                          <span className="text-lg font-bold text-white flex items-center">
                            <FaRupeeSign className="text-base" />
                            {subtotal}
                          </span>
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="flex justify-between items-center text-green-400">
                          <span className="text-sm">Discount{appliedCoupon ? ` (${appliedCoupon})` : ''}</span>
                          <span className="flex items-center font-bold">
                            -<FaRupeeSign className="text-sm" />
                            {discount}
                          </span>
                        </div>
                      )}
                      {!isFree && (
                        <div className="flex justify-between items-center text-gray-400 text-sm">
                          <span>GST ({gstRate}%)</span>
                          <span className="flex items-center">
                            <FaRupeeSign className="text-xs" />
                            {finalPrice != null ? Math.max(0, Math.round(finalPrice - discountedPriceLocal)) : gstLocal}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-gray-600 pt-4 mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-bold text-white">Total Amount</span>
                          <span className="text-3xl font-extrabold text-white flex items-center">
                            {isFree ? (
                              <span className="text-green-400">FREE</span>
                            ) : (
                              <>
                                <FaRupeeSign className="text-2xl" />
                                {payable}
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs">All taxes included</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <FaTimes className="text-red-600 text-sm" />
                      </div>
                      <div>
                        <p className="text-red-900 font-bold text-sm">Payment Failed</p>
                        <p className="text-red-700 text-xs mt-1">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Payment Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayment}
                    disabled={processing}
                    className={`w-full ${
                      isFree
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    } text-white font-bold py-5 rounded-xl text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl`}
                  >
                    {processing ? (
                      <>
                        <FaSpinner className="animate-spin mr-3 text-xl" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <FaLock className="mr-3" />
                        {isFree ? 'Enroll for Free' : `Pay ₹${payable} Now`}
                      </>
                    )}
                  </motion.button>

                  {/* Security Notice */}
                  <div className="text-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-center text-sm text-gray-700 gap-2 mb-2 font-semibold">
                      <FaLock className="text-green-600" />
                      <span>Secured by Razorpay</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      256-bit SSL encrypted • PCI DSS compliant
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Policy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-gray-900">30-Day Money-Back Guarantee</span>
              </div>
              <p className="text-gray-700 font-medium">
                Not satisfied with the course? Request a full refund within 30 days, no questions asked.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RazorpayCheckout;
