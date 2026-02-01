import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { motion } from 'framer-motion';
import { FaQuoteLeft, FaLinkedin, FaTwitter, FaGlobe, FaCheckCircle, FaStar, FaUsers, FaVideo, FaClock, FaCalendar, FaGraduationCap, FaHome } from 'react-icons/fa/index.esm.js';

// Add Inter font
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}

const MentorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMentorDetail();
  }, [id]);

  const loadMentorDetail = async () => {
    try {
      setLoading(true);
      const mentorDoc = await getDoc(doc(db, 'masterclassMosaic', id));
      
      if (mentorDoc.exists()) {
        setMentor({ id: mentorDoc.id, ...mentorDoc.data() });
      } else {
        console.error('Mentor not found');
      }
    } catch (error) {
      console.error('Failed to load mentor details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Mentor not found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      {/* Home Button - Top Right Corner */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
        >
          <FaHome className="text-lg" />
          <span className="font-medium">Home</span>
        </button>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" style={{ background: '#FFFFFF' }}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Mentor Video Section */}
          <div className="relative">
            <div className="relative aspect-video max-w-2xl mx-auto">
              {/* Decorative Corner Brackets */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-3 border-l-3 z-10" style={{ borderColor: '#6C6FF5', borderWidth: '3px' }}></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-3 border-r-3 z-10" style={{ borderColor: '#6C6FF5', borderWidth: '3px' }}></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-3 border-l-3 z-10" style={{ borderColor: '#6C6FF5', borderWidth: '3px' }}></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-3 border-r-3 z-10" style={{ borderColor: '#6C6FF5', borderWidth: '3px' }}></div>
              
              {/* Video Player */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
                style={{ padding: '20px' }}
              >
                {mentor.videoUrl ? (
                  <video
                    src={mentor.videoUrl}
                    controls
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                    poster={mentor.imageUrl || ''}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : mentor.imageUrl ? (
                  <img
                    src={mentor.imageUrl}
                    alt={mentor.alt || 'Mentor'}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <FaVideo className="text-gray-400 text-6xl" />
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Mentor Details Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 
                className="text-5xl font-bold mb-4"
                style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#6C6FF5' }}
              >
                {mentor.name || 'Masterclass Mentor'}
              </h1>
              
              {mentor.title && (
                <p className="text-2xl text-gray-700 mb-2 font-medium">
                  {mentor.title}
                </p>
              )}

              {mentor.university && (
                <p className="text-lg text-gray-600 mb-6">
                  {mentor.university}
                </p>
              )}

              {mentor.bio && (
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {mentor.bio}
                </p>
              )}

              {mentor.quote && (
                <div className="relative p-6 rounded-lg mt-8" style={{ background: '#FFFFFF', border: '2px solid #F3F4F6' }}>
                  <FaQuoteLeft className="text-indigo-300 text-3xl mb-4" />
                  <p 
                    className="text-xl italic text-gray-800"
                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                  >
                    "{mentor.quote}"
                  </p>
                </div>
              )}

              {mentor.expertise && mentor.expertise.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Expertise</h3>
                  <div className="flex flex-wrap gap-3">
                    {mentor.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {mentor.achievements && mentor.achievements.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Achievements</h3>
                  <ul className="space-y-3">
                    {mentor.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span className="text-gray-700">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Social Links */}
              {(mentor.linkedIn || mentor.twitter || mentor.website) && (
                <div className="mt-8 flex gap-4">
                  {mentor.linkedIn && (
                    <a 
                      href={mentor.linkedIn} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaLinkedin />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {mentor.twitter && (
                    <a 
                      href={mentor.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      <FaTwitter />
                      <span>Twitter</span>
                    </a>
                  )}
                  {mentor.website && (
                    <a 
                      href={mentor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <FaGlobe />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Video Section */}
        {mentor.videoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16"
            style={{ background: '#FFFFFF' }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Watch Introduction
            </h2>
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
              {mentor.videoUrl.includes('youtube.com') || mentor.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={mentor.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title="Mentor Introduction Video"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : mentor.videoUrl.includes('vimeo.com') ? (
                <iframe
                  src={mentor.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                  title="Mentor Introduction Video"
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video controls className="absolute inset-0 w-full h-full">
                  <source src={mentor.videoUrl} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </motion.div>
        )}

        {/* Course Sections */}
        {mentor.courseSections && mentor.courseSections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16"
            style={{ background: '#FFFFFF' }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Course Content
            </h2>
            <div className="space-y-6">
              {mentor.courseSections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="bg-white border-l-4 border-indigo-600 p-6 rounded-r-lg shadow-md"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    Section {index + 1}
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line">{section}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Live Sessions Section */}
        {mentor.liveSessions && mentor.liveSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16"
            style={{ background: '#FFFFFF' }}
          >
            <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#0F172A' }}>
              <FaVideo className="inline mr-3 text-indigo-600" />
              Upcoming Live Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mentor.liveSessions.map((session, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-400 transition-all"
                  style={{ background: '#FFFFFF' }}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{session.title || 'Live Session'}</h3>
                  {session.date && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <FaCalendar className="text-indigo-600" />
                      <span>{session.date}</span>
                    </div>
                  )}
                  {session.time && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <FaClock className="text-indigo-600" />
                      <span>{session.time}</span>
                    </div>
                  )}
                  {session.description && (
                    <p className="text-gray-700 mt-3">{session.description}</p>
                  )}
                  {session.registrationUrl && (
                    <a
                      href={session.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Register Now
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Statistics Section */}
        {(mentor.studentsCount || mentor.coursesCount || mentor.rating || mentor.experience) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-16"
            style={{ background: '#FFFFFF' }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {mentor.studentsCount && (
                <div className="text-center p-6 rounded-xl border-2 border-gray-200" style={{ background: '#FFFFFF' }}>
                  <FaUsers className="text-4xl text-indigo-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-800">{mentor.studentsCount}+</div>
                  <div className="text-gray-600 mt-1">Students Taught</div>
                </div>
              )}
              {mentor.coursesCount && (
                <div className="text-center p-6 rounded-xl border-2 border-gray-200" style={{ background: '#FFFFFF' }}>
                  <FaGraduationCap className="text-4xl text-purple-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-800">{mentor.coursesCount}+</div>
                  <div className="text-gray-600 mt-1">Courses Created</div>
                </div>
              )}
              {mentor.rating && (
                <div className="text-center p-6 rounded-xl border-2 border-gray-200" style={{ background: '#FFFFFF' }}>
                  <FaStar className="text-4xl text-yellow-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-800">{mentor.rating}</div>
                  <div className="text-gray-600 mt-1">Average Rating</div>
                </div>
              )}
              {mentor.experience && (
                <div className="text-center p-6 rounded-xl border-2 border-gray-200" style={{ background: '#FFFFFF' }}>
                  <FaCheckCircle className="text-4xl text-green-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-800">{mentor.experience}+</div>
                  <div className="text-gray-600 mt-1">Years Experience</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Testimonials Section */}
        {mentor.testimonials && mentor.testimonials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16"
            style={{ background: '#FFFFFF' }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Student Testimonials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mentor.testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  className="bg-white p-6 rounded-xl border-2 border-gray-100 shadow-md hover:shadow-lg transition-shadow"
                >
                  <FaQuoteLeft className="text-indigo-300 text-2xl mb-3" />
                  <p className="text-gray-700 italic mb-4">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    {testimonial.studentImage && (
                      <img src={testimonial.studentImage} alt={testimonial.studentName} className="w-12 h-12 rounded-full object-cover" />
                    )}
                    <div>
                      <div className="font-semibold text-gray-800">{testimonial.studentName}</div>
                      {testimonial.studentRole && (
                        <div className="text-sm text-gray-600">{testimonial.studentRole}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Additional Images Gallery */}
        {mentor.additionalImages && mentor.additionalImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-16"
            style={{ background: '#FFFFFF' }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentor.additionalImages.map((imageUrl, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                  className="relative aspect-video rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
                >
                  <img
                    src={imageUrl}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>MentLearn</h3>
              <p className="text-gray-300">Empowering learners with world-class mentorship and education.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
                <li><a href="/courses" className="text-gray-300 hover:text-white transition-colors">Our Courses</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors"><FaLinkedin className="text-2xl" /></a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors"><FaTwitter className="text-2xl" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} MentLearn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MentorDetail;
