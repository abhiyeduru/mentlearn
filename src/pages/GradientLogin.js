import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaArrowLeft, FaGoogle } from 'react-icons/fa/index.esm.js';
import MenteoLogo from '../components/MenteoLogo.js';
import ChatUsButton from '../components/ChatUsButton.js';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase/firebase.js';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const GradientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const mentorQuotes = [
    '"Consistency beats intensity. Ship something small every day."',
    '"Mentneo grads get hired because they finish real projects."',
    '"Debugging is where you truly learn. Keep going."'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Login and let AuthContext handle the user data fetch
      await login(email, password);
      
      // Navigate to dashboard - RoleBasedRedirect will handle role-based routing
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document for first-time Google sign-in
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
      }
      
      console.log('Google sign-in successful');
      navigate('/dashboard');
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute -bottom-1 left-0 w-full h-48"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="rgba(255,255,255,0.1)"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,128C672,128,768,160,864,176C960,192,1056,192,1152,176C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col">
        <div className="mb-8">
          <Link
            to="/"
            className="flex items-center text-white hover:text-blue-100 transition-colors font-semibold"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>

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
                <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">Welcome Back</h2>
                <p className="text-gray-600 text-center text-sm mb-6">Sign in to continue learning</p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                  <div className="text-right">
                    <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
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
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
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
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <FaGoogle className="mr-3 text-xl text-red-500" />
                  Sign in with Google
                </button>

                <p className="mt-6 text-center text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Sign Up
                  </Link>
                </p>

                <p className="mt-6 text-center text-xs text-gray-500">
                  By signing in, you agree to our{' '}
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
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
                <p className="text-sm uppercase tracking-[0.3em] text-blue-100">Mentneo Mentors</p>
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
                  <span>Live batches, doubt-clearing, and mock interviews every week.</span>
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

export default GradientLogin;
