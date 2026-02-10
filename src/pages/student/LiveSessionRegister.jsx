import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, orderBy } from 'firebase/firestore';
import {
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaUserGraduate,
  FaCheckCircle,
  FaWhatsapp,
  FaBuilding,
  FaEnvelope,
  FaUser
} from 'react-icons/fa';
import { IoRocketSharp } from "react-icons/io5";

const LiveSessionRegister = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetchingSessions, setFetchingSessions] = useState(true);
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: currentUser?.displayName || '',
    whatsapp: '',
    email: currentUser?.email || '',
    college: ''
  });

  const [error, setError] = useState(null);

  // Fetch active sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setError(null);
        // Debug: Log that we are attempting to fetch
        console.log("Fetching sessions...");

        const sessionsRef = collection(db, 'liveSessionForms');
        // Simple query first to debug
        const q = query(
          sessionsRef,
          where('isActive', '==', true)
        );

        const snapshot = await getDocs(q);
        console.log("Snapshot empty?", snapshot.empty);

        const sessions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log("Fetched sessions:", sessions);
        setActiveSessions(sessions);
        if (sessions.length > 0) {
          setSelectedSessionId(sessions[0].id);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError(`Failed to load sessions. ${err.message}`);
      } finally {
        setFetchingSessions(false);
      }
    };

    fetchSessions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const activeSession = activeSessions.find(s => s.id === selectedSessionId) || activeSessions[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeSession) return;

    setLoading(true);

    try {
      // Save registration to Firebase
      await addDoc(collection(db, 'liveSessionRegistrations'), {
        ...formData,
        userId: currentUser?.uid || null,
        status: 'pending',
        sessionId: activeSession.id,
        sessionTitle: activeSession.title,
        sessionDate: activeSession.sessionDate,
        sessionTime: activeSession.sessionTime,
        registeredAt: Timestamp.now(),
        createdAt: new Date().toISOString()
      });

      setSubmitted(true);

      // No auto-redirect, let the user read the success message
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('Error submitting registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingSessions) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6A5AF9]"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-4 font-['Inter']">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-center max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Sessions</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            If you see "Missing or insufficient permissions", you need to update Firestore Rules.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No active sessions state
  if (activeSessions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-4 font-['Inter']">
        <FaVideo className="text-6xl text-gray-600 mb-6" />
        <h1 className="text-3xl font-bold font-['Poppins'] mb-2">No Live Sessions Scheduled</h1>
        <p className="text-gray-400 text-center max-w-md">
          Check back later or follow our updates to catch the next live masterclass.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 px-6 py-3 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-4 font-['Inter']">
        <div className="bg-[#151A2D] p-8 rounded-2xl border border-gray-800 text-center max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-3xl font-bold font-['Poppins'] mb-4">You're In! 🚀</h2>
          <p className="text-gray-400 mb-8">
            Your seat is confirmed for <span className="text-white font-semibold">{activeSession?.title}</span> on <span className="text-white font-semibold">{activeSession?.sessionDate}, {activeSession?.sessionTime}</span>.
            Check your email for the joining link.
          </p>
          <button
            onClick={() => navigate(currentUser ? '/student/dashboard' : '/')}
            className="w-full py-3 bg-gradient-to-r from-[#6A5AF9] to-[#00E5FF] rounded-xl font-semibold text-white shadow-lg hover:shadow-[#6A5AF9]/25 transition-all"
          >
            {currentUser ? 'Go to Dashboard' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-['Inter'] overflow-x-hidden">
      {/* Background Glow Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6A5AF9]/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#00E5FF]/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT COLUMN: Hero & Content */}
          <div className="space-y-10">

            {/* Hero Section */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-bold border border-red-500/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> LIVE
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20 flex items-center gap-2">
                  <FaClock className="text-xs" /> {activeSession?.duration || '90'} Minutes
                </span>
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20 flex items-center gap-2">
                  <FaUserGraduate className="text-xs" /> Free Session
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-['Poppins'] leading-tight">
                {activeSession?.title ? (
                  <>
                    Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A5AF9] to-[#00E5FF]">{activeSession.title}</span><br />
                    Live & Hands-on.
                  </>
                ) : (
                  <>
                    Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A5AF9] to-[#00E5FF]">Real Skills.</span><br />
                    Not Just Certificates.
                  </>
                )}
              </h1>

              {/* Subtext */}
              <p className="text-lg text-gray-400 max-w-lg">
                {activeSession?.description || "Live hands-on session by Mentneo mentors. Real projects • Real guidance • Zero fluff"}
              </p>
            </div>

            {/* Session Info Cards */}
            <div>
              <h3 className="text-xl font-bold font-['Poppins'] mb-6 flex items-center gap-2">
                What You'll Actually Learn <span className="text-2xl">👇</span>
              </h3>
              <div className="grid gap-4">
                {[
                  { icon: <IoRocketSharp className="text-[#00E5FF]" />, text: "Build a real-world project (live)", desc: "No theory, just code." },
                  { icon: <FaUserGraduate className="text-[#6A5AF9]" />, text: "Understand how devs think", desc: "Problem-solving > Syntax." },
                  { icon: <FaBuilding className="text-pink-500" />, text: "How to crack internships & startups", desc: "Insider roadmap." }
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#151A2D] p-4 rounded-xl border border-gray-800 flex items-start gap-4 hover:border-gray-700 transition-colors">
                    <div className="p-3 bg-gray-800/50 rounded-lg text-xl">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{item.text}</h4>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Date", value: activeSession?.sessionDate, icon: <FaCalendarAlt /> },
                { label: "Time", value: activeSession?.sessionTime, icon: <FaClock /> },
                { label: "Mode", value: "Live on Meet", icon: <FaVideo /> },
                { label: "For", value: "Students / Devs", icon: <FaUserGraduate /> }
              ].map((detail, idx) => (
                <div key={idx} className="bg-[#151A2D] p-4 rounded-xl border border-gray-800 text-center hover:-translate-y-1 transition-transform">
                  <div className="text-gray-400 mb-2 flex justify-center text-xl">{detail.icon}</div>
                  <div className="text-sm text-gray-400">{detail.label}</div>
                  <div className="font-bold text-white truncate px-1">{detail.value || 'TBA'}</div>
                </div>
              ))}
            </div>

            {/* Mentor Section */}
            {activeSession?.instructor && (
              <div className="flex items-center gap-5 bg-[#151A2D]/50 p-5 rounded-2xl border border-dashed border-gray-700">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#6A5AF9] to-[#00E5FF] p-[2px]">
                    <img
                      src={activeSession?.mentorImage || "https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
                      alt="Mentor"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-[10px] px-2 py-0.5 rounded-full text-black font-bold">
                    LIVE
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#00E5FF] font-bold uppercase tracking-wider mb-1">Meet Your Mentor</p>
                  <h4 className="font-bold text-lg leading-none mb-1">{activeSession.instructor} <span className="text-gray-400 font-normal text-sm">| {activeSession.mentorTitle || 'SDE-2'}</span></h4>
                  <p className="text-sm text-gray-400 italic">"{activeSession.mentorQuote || 'No slides. Only live building.'}"</p>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Registration Form */}
          <div className="relative">
            <button
              onClick={() => navigate('/')}
              className="absolute -top-10 right-0 text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors"
            >
              Go Back Home
            </button>
            {/* Glow on form */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#6A5AF9]/20 to-[#00E5FF]/20 blur-[60px] rounded-full"></div>

            <div className="relative bg-[#151A2D] p-6 md:p-8 rounded-3xl border border-gray-700 shadow-2xl backdrop-blur-sm">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold font-['Poppins']">Secure Your Spot 🔥</h3>
                <p className="text-gray-400 text-sm mt-2">Limited seats. Fills up fast.</p>

                {/* Progress Bar (FOMO) */}
                <div className="mt-4 bg-gray-800 rounded-full h-2 w-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#6A5AF9] to-[#00E5FF] h-full w-[85%] rounded-full animate-pulse"></div>
                </div>
                <div className="flex justify-between text-xs mt-2 text-gray-500 font-medium">
                  <span>85% booked</span>
                  <span className="text-[#00E5FF]">Few spots left!</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Session Selection (Dynamic) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Select Session</label>
                  <div className="relative">
                    <FaVideo className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <select
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#6A5AF9] focus:ring-1 focus:ring-[#6A5AF9] transition-all appearance-none cursor-pointer"
                    >
                      {activeSessions.map(session => (
                        <option key={session.id} value={session.id}>
                          {session.title} ({session.sessionDate})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      ▼
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#6A5AF9] focus:ring-1 focus:ring-[#6A5AF9] transition-all placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Phone / WhatsApp</label>
                  <div className="relative">
                    <FaWhatsapp className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      required
                      placeholder="+91 99999 99999"
                      className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#6A5AF9] focus:ring-1 focus:ring-[#6A5AF9] transition-all placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="rahul@example.com"
                      className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#6A5AF9] focus:ring-1 focus:ring-[#6A5AF9] transition-all placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">College / Role (Optional)</label>
                  <div className="relative">
                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      placeholder="e.g. IIT Delhi / Frontend Dev"
                      className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#6A5AF9] focus:ring-1 focus:ring-[#6A5AF9] transition-all placeholder-gray-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 bg-gradient-to-r from-[#6A5AF9] to-[#00E5FF] rounded-xl font-bold text-white text-lg shadow-lg shadow-[#6A5AF9]/25 hover:shadow-[#6A5AF9]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Registering...'
                  ) : (
                    <>
                      Register for Free <IoRocketSharp />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  No spam. Only important session updates. 🔒
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionRegister;
