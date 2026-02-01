import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa/index.esm.js';
import MenteoLogo from '../components/MenteoLogo.js';
import ChatUsButton from '../components/ChatUsButton.js';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase/firebase.js';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const GradientSignup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const mentorQuotes = [
    '"Build portfolio-grade projects, not just todo apps."',
    '"Every bug you fix now saves you hours on the job."',
    '"Show up daily. Momentum compounds."'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.phone
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          role: 'student',
          createdAt: serverTimestamp(),
          phone: user.phoneNumber || '',
          hasPaid: false,
          accessGranted: false,
          photoURL: user.photoURL
        });
        
        // Redirect to payment flow for new users
        navigate('/payment-flow', { 
          state: { 
            fromSignup: true,
            autoInitiate: true 
          } 
        });
      } else {
        // Existing user, go to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google sign-up error:', err);
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-cyan-400/30 animate-gradient-shift opacity-70" />

      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col min-h-screen justify-center">
        <Link to="/" className="absolute top-6 left-6 text-white hover:text-white/80 transition-colors flex items-center gap-2 text-sm font-medium">
          <span>← Back to Home</span>
        </Link>

        <div className="flex-1 grid lg:grid-cols-12 gap-8 items-center">
          <div className="w-full max-w-md lg:col-span-6 lg:justify-self-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <Link to="/" className="inline-block mb-4">
                <MenteoLogo size="large" showText />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-blue-500/40 via-purple-500/30 to-cyan-400/30 rounded-3xl blur-2xl"
                animate={{ scale: [1, 1.04, 1], opacity: [0.35, 0.55, 0.35] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              />
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">Create Account</h2>
                <p className="text-gray-600 text-center text-sm mb-6">Join thousands of students learning</p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-800 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="John"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-800 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Doe"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="+91 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Creating account...
                      </div>
                    ) : (
                      'Sign Up'
                    )}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-600">or</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed mb-6"
                >
                  <FaGoogle className="mr-3 text-xl text-red-500" />
                  Sign up with Google
                </button>

                <p className="text-center text-gray-600 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign In</Link>
                </p>

                <p className="mt-6 text-center text-xs text-gray-500">
                  By signing up, you agree to our{' '}
                  <Link to="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                </p>
              </div>
            </motion.div>
          </div>

          <div className="hidden lg:block lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="h-full rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl p-8 text-white relative overflow-hidden"
            >
              <motion.div
                className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-500/30 to-cyan-400/20 rounded-full blur-3xl"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
              />
              <div className="relative space-y-6">
                <p className="text-sm uppercase tracking-[0.3em] text-blue-100">Mentneo Playbook</p>
                <div className="space-y-4">
                  {mentorQuotes.map((quote, idx) => (
                    <motion.div
                      key={quote}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                      className="border border-white/20 rounded-xl p-4 bg-white/5 shadow-inner"
                    >
                      <p className="text-lg leading-relaxed">{quote}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-2 text-sm text-blue-100">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span>Career services, mock interviews, and weekly mentor AMAs.</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ChatUsButton label="Chat with us" variant="whatsapp" />
    </div>
  );
};

export default GradientSignup;
