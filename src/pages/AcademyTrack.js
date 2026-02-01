import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaArrowRight,
  FaRocket,
  FaUserGraduate,
  FaLaptopCode,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaRegLightbulb,
  FaRegClock,
  FaTasks
} from 'react-icons/fa/index.esm.js';
import MenteoLogo from '../components/MenteoLogo.js';

const outcomes = [
  'Strong programming fundamentals with JavaScript and Python',
  'Front-end foundations with HTML, CSS, and responsive UI',
  'Backend basics with Node.js, REST APIs, and databases',
  'Mentor-led project reviews every sprint',
  'Interview-focused problem solving and communication skills'
];

const modules = [
  {
    title: 'Semester 1: Foundations',
    items: ['HTML/CSS essentials', 'Modern JavaScript', 'Git and GitHub workflows', 'Responsive layouts']
  },
  {
    title: 'Semester 2: Frontend Depth',
    items: ['React fundamentals', 'State management patterns', 'UI accessibility', 'Component testing basics']
  },
  {
    title: 'Semester 3: Backend Basics',
    items: ['Node.js + Express', 'REST APIs', 'MongoDB fundamentals', 'Authentication and auth flows']
  },
  {
    title: 'Semester 4: Career Readiness',
    items: ['System design primers', 'Interview prep labs', 'Portfolio polish', 'Career playbook']
  }
];

const highlights = [
  {
    icon: <FaRocket className="text-2xl text-[#007bff]" />,
    title: 'IITian-inspired pace',
    desc: 'Weekly sprints with crisp milestones and mentor nudges.'
  },
  {
    icon: <FaUserGraduate className="text-2xl text-purple-500" />,
    title: 'Built for students',
    desc: 'Perfect for 1st–3rd year students who want a head start.'
  },
  {
    icon: <FaLaptopCode className="text-2xl text-green-400" />,
    title: 'Project-first',
    desc: 'Ship a portfolio every term with mentor reviews and feedback.'
  },
  {
    icon: <FaRegClock className="text-2xl text-yellow-400" />,
    title: 'Flexible schedules',
    desc: 'Weekend mentor labs plus on-demand recorded breakdowns.'
  }
];

const AcademyTrack = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800 font-poppins">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-800 transition-all shadow"
        >
          <FaArrowLeft className="mr-2" />
          Back
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
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 shadow-2xl text-center">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-4">
                🚀 Coming Soon
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Launching Soon!
            </h2>
            <p className="text-xl text-white/90 mb-6">
              Thank you for your interest in Academy Track
            </p>
            <p className="text-white/80 max-w-2xl mx-auto mb-6">
              We're putting the finishing touches on this program. Sign up below to be notified when we launch and get early bird offers!
            </p>
            <Link to="/demo" className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-2xl shadow-lg hover:bg-gray-100 transition-all">
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
            Academy Track
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Learn like top IITians. Semester-style sprints, live mentor labs, and a portfolio that stands out before placements.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/demo" className="px-8 py-3 rounded-2xl bg-[#007bff] text-white font-semibold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center">
              Book a Free Demo <FaArrowRight className="ml-2" />
            </Link>
            <a href="#curriculum" className="px-8 py-3 rounded-2xl border-2 border-[#007bff] text-[#007bff] font-semibold hover:bg-blue-50 transition-all flex items-center justify-center">
              View Curriculum <FaArrowRight className="ml-2" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Highlights */}
      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
              <div className="mb-3">{item.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <FaCheckCircle className="text-green-500 text-xl" />
            <h2 className="text-2xl font-bold text-gray-900">What you leave with</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {outcomes.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <FaRegLightbulb className="text-[#007bff] mt-1" />
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="py-12 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FaChalkboardTeacher className="text-[#6f42c1] text-2xl" />
          <h2 className="text-2xl font-bold text-gray-900">Curriculum blueprint</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, idx) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{mod.title}</h3>
                <FaTasks className="text-gray-400" />
              </div>
              <ul className="space-y-2 text-gray-700 text-sm">
                {mod.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <FaArrowRight className="text-[#007bff] mt-1" />
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
        <div className="bg-gradient-to-r from-[#007bff] to-[#1a56db] rounded-3xl p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left max-w-xl">
              <p className="flex items-center text-white text-sm mb-2">
                <FaCalendarAlt className="mr-2" /> New cohort starts soon
              </p>
              <h3 className="text-2xl font-bold text-white">Grab your seat for the next Academy Track batch</h3>
              <p className="text-white/90 mt-2">Limited seats. Weekly mentor hours and project showcases.</p>
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-sm">
          <div className="flex items-center gap-3 text-gray-900">
            <MenteoLogo size="small" />
            <span className="font-bold">Mentneo Academy Track</span>
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

export default AcademyTrack;
