import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaArrowRight,
  FaBolt,
  FaBriefcase,
  FaLaptopCode,
  FaChartLine,
  FaClipboardCheck,
  FaCalendarCheck,
  FaRegLightbulb,
  FaCheckCircle
} from 'react-icons/fa';
import MenteoLogo from '../components/MenteoLogo.js';

const uspCards = [
  {
    icon: <FaBolt className="text-2xl text-[#ffb020]" />,
    title: 'High-intensity sprints',
    desc: 'Structured 8–16 week path with measurable weekly outcomes.'
  },
  {
    icon: <FaBriefcase className="text-2xl text-[#6f42c1]" />,
    title: 'Placement-first',
    desc: 'Career coaching, mock interviews, and referral network built-in.'
  },
  {
    icon: <FaLaptopCode className="text-2xl text-[#4ade80]" />,
    title: 'Production projects',
    desc: 'Backend + frontend builds, deploys, and observable metrics.'
  }
];

const outcomes = [
  '2–3 full-stack projects deployed to production',
  'DSA + system design for product interviews',
  'Interview readiness with mocks and resume lab',
  'Clear weekly KPIs and mentor accountability',
  'Placement support and referral loops'
];

const roadmap = [
  {
    phase: 'Week 1–2',
    title: 'Foundations Reset',
    bullets: ['Modern JS/TS refresh', 'Git workflows', 'Clean code and reviews']
  },
  {
    phase: 'Week 3–6',
    title: 'Product Engineering',
    bullets: ['React + state patterns', 'Node/Express APIs', 'Mongo/Postgres basics', 'Cloud deploys']
  },
  {
    phase: 'Week 7–9',
    title: 'Systems & Performance',
    bullets: ['Caching and queues', 'AuthN/AuthZ patterns', 'Observability basics', 'Performance tuning']
  },
  {
    phase: 'Week 10–12',
    title: 'Interview Lab',
    bullets: ['DSA drills', 'System design primers', 'Mock interviews', 'Offer negotiation playbook']
  }
];

const IntensiveTrack = () => {
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
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 shadow-2xl text-center">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-4">
                🚀 Coming Soon
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Launching Soon!
            </h2>
            <p className="text-xl text-white/90 mb-6">
              Thank you for your interest in Intensive Track
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
            Intensive Track
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            A career-acceleration bootcamp for final-year students and graduates. Build, deploy, interview, and get placed fast.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/demo" className="px-8 py-3 rounded-2xl bg-[#ffb020] text-white font-semibold shadow-lg hover:bg-amber-600 transition-all flex items-center justify-center">
              Speak to Admissions <FaArrowRight className="ml-2" />
            </Link>
            <a href="#roadmap" className="px-8 py-3 rounded-2xl border-2 border-[#ffb020] text-[#ffb020] font-semibold hover:bg-amber-50 transition-all flex items-center justify-center">
              See Roadmap <FaArrowRight className="ml-2" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* USPs */}
      <section className="py-12 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {uspCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
            >
              <div className="mb-3">{card.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{card.title}</h3>
              <p className="text-gray-600 text-sm">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-8 border border-orange-200 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <FaCheckCircle className="text-green-500 text-xl" />
            <h2 className="text-2xl font-bold text-gray-900">You will be job ready</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {outcomes.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <FaRegLightbulb className="text-[#ffb020] mt-1" />
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="py-12 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FaChartLine className="text-[#6f42c1] text-2xl" />
          <h2 className="text-2xl font-bold text-gray-900">12-week roadmap</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmap.map((phase, idx) => (
            <motion.div
              key={phase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{phase.phase}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{phase.title}</h3>
                </div>
                <FaClipboardCheck className="text-gray-400" />
              </div>
              <ul className="space-y-2 text-gray-700 text-sm">
                {phase.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <FaArrowRight className="text-[#ffb020] mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-r from-[#ffb020] to-[#f97316] rounded-3xl p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left max-w-xl">
              <p className="flex items-center text-white text-sm mb-2">
                <FaCalendarCheck className="mr-2" /> Next cohort opens soon
              </p>
              <h3 className="text-2xl font-bold text-white">Join the Intensive Track</h3>
              <p className="text-white/90 mt-2">Apply now to secure a mentor slot and placement support.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link to="/signup" className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-[#0a0a1a] font-semibold shadow-lg hover:scale-105 transition-all flex items-center justify-center">
                Apply Now
              </Link>
              <Link to="/demo" className="w-full sm:w-auto px-6 py-3 rounded-2xl border-2 border-white text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center">
                Request Callback
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-sm">
          <div className="flex items-center gap-3 text-gray-900">
            <MenteoLogo size="small" />
            <span className="font-bold">Mentneo Intensive Track</span>
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-gray-900">About</Link>
            <Link to="/hire-from-us" className="hover:text-gray-900">Hire From Us</Link>
            <Link to="/terms" className="hover:text-gray-900">Terms</Link>
          </div>
          <div className="text-xs">© {new Date().getFullYear()} Mentneo. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default IntensiveTrack;
