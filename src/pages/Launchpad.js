import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaArrowRight,
  FaUserAstronaut,
  FaLightbulb,
  FaClipboardList,
  FaUsers,
  FaHandshake,
  FaPlayCircle,
  FaCalendarAlt,
  FaCheckCircle
} from 'react-icons/fa';
import MenteoLogo from '../components/MenteoLogo.js';

const pillars = [
  {
    icon: <FaLightbulb className="text-2xl text-[#f97316]" />,
    title: 'Career switch friendly',
    desc: 'For professionals pivoting into tech with guided hand-holding.'
  },
  {
    icon: <FaUsers className="text-2xl text-[#22c55e]" />,
    title: '1:1 mentorship',
    desc: 'Weekly mentor calls, async feedback, and accountability pods.'
  },
  {
    icon: <FaClipboardList className="text-2xl text-[#3b82f6]" />,
    title: 'Portfolio-first',
    desc: 'Capstone projects that mirror real-world product teams.'
  }
];

const journey = [
  {
    title: 'Phase 1: Foundations (Weeks 1–3)',
    bullets: ['Web fundamentals (HTML, CSS, JS)', 'Problem solving drills', 'Version control and collaboration']
  },
  {
    title: 'Phase 2: Product Build (Weeks 4–8)',
    bullets: ['React + UI systems', 'APIs and integrations', 'Deployment and monitoring']
  },
  {
    title: 'Phase 3: Career Launch (Weeks 9–12)',
    bullets: ['Interview prep', 'Mock interviews + feedback', 'Hiring partner showcases']
  }
];

const Launchpad = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800 font-poppins">
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-800 transition-all shadow"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
      </div>

      {/* Launching Soon Banner */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-20 pb-8 px-4 sm:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-3xl p-8 shadow-2xl text-center">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-4">
                🚀 Coming Soon
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Launching Soon!
            </h2>
            <p className="text-xl text-white/90 mb-6">
              Thank you for your interest in Launchpad
            </p>
            <p className="text-white/80 max-w-2xl mx-auto mb-6">
              We're putting the finishing touches on this program. Sign up below to be notified when we launch and get early bird offers!
            </p>
            <Link to="/demo" className="inline-block px-8 py-3 bg-white text-orange-600 font-semibold rounded-2xl shadow-lg hover:bg-gray-100 transition-all">
              Notify Me When It Launches
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Hero */}
      <section className="pt-12 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <MenteoLogo size="large" showText />
          <h1 className="text-4xl md:text-5xl font-extrabold mt-6 mb-4 text-gray-900">
            Launchpad
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            A fast-track bootcamp to land your first tech role. Build, ship, and pitch with mentors who have done it before.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/demo" className="px-8 py-3 rounded-2xl bg-[#f97316] text-white font-semibold shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center">
              Book a Callback <FaArrowRight className="ml-2" />
            </Link>
            <a href="#journey" className="px-8 py-3 rounded-2xl border-2 border-[#f97316] text-[#f97316] font-semibold hover:bg-orange-50 transition-all flex items-center justify-center">
              View Journey <FaArrowRight className="ml-2" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Pillars */}
      <section className="py-12 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
            >
              <div className="mb-3">{pillar.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{pillar.title}</h3>
              <p className="text-gray-600 text-sm">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Journey */}
      <section id="journey" className="py-12 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FaUserAstronaut className="text-[#22c55e] text-2xl" />
          <h2 className="text-2xl font-bold text-gray-900">12-week journey</h2>
        </div>
        <div className="space-y-4">
          {journey.map((phase, idx) => (
            <motion.div
              key={phase.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{phase.title}</h3>
                <FaPlayCircle className="text-gray-400" />
              </div>
              <ul className="space-y-2 text-gray-700 text-sm">
                {phase.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <FaArrowRight className="text-[#f97316] mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hire-ready */}
      <section className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 border border-green-200 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <FaHandshake className="text-[#22c55e] text-xl" />
            <h2 className="text-2xl font-bold text-gray-900">Built with hiring partners</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <FaCheckCircle className="text-[#22c55e] mt-1" />
              <span>Portfolio showcase day with partner recruiters</span>
            </div>
            <div className="flex items-start gap-2">
              <FaCheckCircle className="text-[#22c55e] mt-1" />
              <span>Behavioral + technical mock interviews</span>
            </div>
            <div className="flex items-start gap-2">
              <FaCheckCircle className="text-[#22c55e] mt-1" />
              <span>Offer negotiation playbook</span>
            </div>
            <div className="flex items-start gap-2">
              <FaCheckCircle className="text-[#22c55e] mt-1" />
              <span>Post-offer mentorship for 30 days</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-r from-[#f97316] to-[#22c55e] rounded-3xl p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left max-w-xl">
              <p className="flex items-center text-white text-sm mb-2">
                <FaCalendarAlt className="mr-2" /> Next Launchpad cohort opens soon
              </p>
              <h3 className="text-2xl font-bold text-white">Jump-start your tech career</h3>
              <p className="text-white/90 mt-2">Limited seats. Fast-track mentorship plus hiring support.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link to="/signup" className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-[#0a0a1a] font-semibold shadow-lg hover:scale-105 transition-all flex items-center justify-center">
                Apply Now
              </Link>
              <Link to="/demo" className="w-full sm:w-auto px-6 py-3 rounded-2xl border-2 border-white text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center">
                Talk to a Mentor
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-sm">
          <div className="flex items-center gap-3 text-gray-900">
            <MenteoLogo size="small" />
            <span className="font-bold">Mentneo Launchpad</span>
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-gray-900">About</Link>
            <Link to="/courses" className="hover:text-gray-900">Courses</Link>
            <Link to="/terms" className="hover:text-gray-900">Terms</Link>
          </div>
          <div className="text-xs">© {new Date().getFullYear()} Mentneo. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Launchpad;
