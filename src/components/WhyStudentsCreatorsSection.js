import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

// Add Poppins font if not already included
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
  
  .video-container-custom {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    will-change: transform;
  }
  
  @media (max-width: 1024px) {
    .desktop-students {
      font-size: 72px !important;
    }
    .desktop-creators {
      font-size: 80px !important;
    }
    .video-container-custom {
      width: 390px !important;
      height: 488px !important;
      border-top-left-radius: 0px !important;
      border-bottom-left-radius: 162px !important;
      border-top-right-radius: 162px !important;
      border-bottom-right-radius: 0px !important;
    }
  }
  
  @media (max-width: 768px) {
    .desktop-students {
      font-size: 48px !important;
    }
    .desktop-creators {
      font-size: 52px !important;
    }
    .video-container-custom {
      width: 100% !important;
      max-width: 340px !important;
      height: 425px !important;
      border-top-left-radius: 0px !important;
      border-bottom-left-radius: 141px !important;
      border-top-right-radius: 141px !important;
      border-bottom-right-radius: 0px !important;
    }
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('#why-students-creators-styles')) {
  style.id = 'why-students-creators-styles';
  document.head.appendChild(style);
}

const WhyStudentsCreatorsSection = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = React.useRef(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const snap = await getDocs(collection(db, 'landingVideos'));
      const items = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(v => v.active !== false)
        .sort((a, b) => (b.featured === true) - (a.featured === true) || (a.order || 0) - (b.order || 0));
      
      setVideos(items);
      if (items.length > 0) {
        setSelectedVideo(items.find(v => v.featured) || items[0]);
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  const handleVideoEnd = () => {
    // Find current video index
    const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
    // Move to next video, or loop back to first
    const nextIndex = (currentIndex + 1) % videos.length;
    setSelectedVideo(videos[nextIndex]);
  };

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-blue-50 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null; // Don't show section if no videos
  }

  return (
    <section className="py-16 lg:py-24 bg-transparent relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-transparent rounded-b-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-transparent to-transparent rounded-t-[100px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Section - Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Heading */}
            <div>
              <h2 className="leading-tight text-left" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                {/* WHY */}
                <div style={{ 
                  fontSize: '42px',
                  fontWeight: 800,
                  color: '#000000',
                  lineHeight: '1.0',
                  letterSpacing: '1px',
                  marginBottom: '0px'
                }}
                className="tablet:text-[34px] mobile:text-[28px]">
                  WHY
                </div>
                
                {/* STUDENTS & */}
                <div style={{ 
                  lineHeight: '0.95',
                  marginBottom: '0px',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '16px'
                }}>
                  <span style={{ 
                    fontSize: '95px',
                    fontWeight: 800,
                    background: 'linear-gradient(90deg, #5F6BFF 0%, #4DA3FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-1px'
                  }}
                  className="desktop-students mobile:text-[46px] tablet:text-[70px]">
                    STUDENTS
                  </span>
                  
                  <span style={{ 
                    fontSize: '58px',
                    fontWeight: 700,
                    color: '#5A5A7A',
                    letterSpacing: '0px'
                  }}
                  className="tablet:text-[46px] mobile:text-[32px]">
                    &
                  </span>
                </div>
                
                {/* CREATORS - BIGGEST WORD */}
                <div style={{ 
                  fontSize: '105px',
                  fontWeight: 800,
                  background: 'linear-gradient(90deg, #4DA3FF 0%, #6BC6FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: '0.95',
                  letterSpacing: '-1.5px',
                  marginBottom: '-10px'
                }}
                className="desktop-creators mobile:text-[50px] tablet:text-[78px]">
                  CREATORS
                </div>
                
                {/* JOIN US....? */}
                <div style={{ 
                  lineHeight: '1.0',
                  marginBottom: '0px',
                  marginTop: '0px'
                }}
                className="flex items-baseline gap-[12px]">
                  <span style={{ 
                    fontSize: '46px',
                    fontWeight: 700,
                    color: '#000000',
                    letterSpacing: '0px'
                  }}
                  className="tablet:text-[36px] mobile:text-[32px]">
                    JOIN
                  </span>
                  <span style={{ 
                    fontSize: '78px',
                    fontWeight: 800,
                    color: '#B56AFF',
                    letterSpacing: '0px'
                  }}
                  className="tablet:text-[60px] mobile:text-[44px]">
                    US
                  </span>
                  <span style={{ 
                    fontSize: '38px',
                    fontWeight: 400,
                    color: '#000000',
                    letterSpacing: '6px'
                  }}
                  className="tablet:text-[30px] mobile:text-[24px]">
                    .....
                  </span>
                  <span style={{ 
                    fontSize: '54px',
                    fontWeight: 700,
                    color: '#000000',
                    letterSpacing: '0px'
                  }}
                  className="tablet:text-[42px] mobile:text-[34px]">
                    ?
                  </span>
                </div>
              </h2>
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-6">
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                APPLY NOW
              </motion.a>
              
              {/* Video Thumbnails */}
              <div className="flex -space-x-3">
                {videos.slice(0, 4).map((video, index) => (
                  <motion.button
                    key={video.id}
                    onClick={() => handleVideoSelect(video)}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    className={`relative w-12 h-12 rounded-full border-3 overflow-hidden transition-all duration-300 ${
                      selectedVideo?.id === video.id 
                        ? 'border-blue-600 ring-4 ring-blue-200 dark:ring-blue-800' 
                        : 'border-white dark:border-slate-700'
                    }`}
                    style={{ zIndex: videos.length - index }}
                  >
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <FaPlay className="text-white text-xs" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Video Title */}
            <AnimatePresence mode="wait">
              {selectedVideo && (
                <motion.div
                  key={selectedVideo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  <p className="font-medium">Now Playing: <span className="text-blue-600 dark:text-blue-400">{selectedVideo.title}</span></p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Section - Video Player */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center items-center"
          >
            <AnimatePresence mode="wait">
              {selectedVideo && (
                <motion.div
                  key={selectedVideo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="video-container-custom"
                  style={{ 
                    position: 'relative',
                    width: '520px',
                    height: '650px',
                    overflow: 'hidden',
                    backgroundColor: '#000000',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    borderTopRightRadius: '215px',
                    borderBottomLeftRadius: '215px',
                    borderTopLeftRadius: '0px',
                    borderBottomRightRadius: '0px',
                    WebkitBackfaceVisibility: 'hidden',
                    MozBackfaceVisibility: 'hidden',
                    WebkitTransform: 'translate3d(0, 0, 0)',
                    MozTransform: 'translate3d(0, 0, 0)'
                  }}
                >
                  {/* Video Container */}
                  <div style={{ 
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000000'
                  }}>
                    {selectedVideo.type === 'upload' ? (
                      // Uploaded video file
                      <video
                        ref={videoRef}
                        src={selectedVideo.videoUrl}
                        autoPlay
                        muted={isMuted}
                        playsInline
                        onEnded={handleVideoEnd}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      // YouTube video - Note: YouTube iframe doesn't support onEnded easily
                      // YouTube videos will loop automatically with the loop parameter
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${selectedVideo.videoId}&controls=0&modestbranding=1&rel=0`}
                        title={selectedVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          objectFit: 'cover'
                        }}
                      ></iframe>
                    )}
                    
                    {/* Sound Toggle Button */}
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm p-3 rounded-full hover:bg-black/70 transition-all cursor-pointer"
                      aria-label={isMuted ? "Unmute video" : "Mute video"}
                    >
                      {isMuted ? (
                        <FaVolumeMute className="text-white text-lg" />
                      ) : (
                        <FaVolumeUp className="text-white text-lg" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyStudentsCreatorsSection;
