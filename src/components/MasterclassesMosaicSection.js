import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Add Inter font
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}

const MasterclassesMosaicSection = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const snap = await getDocs(collection(db, 'masterclassMosaic'));
      let items = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(v => v.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // If no mosaic images, try to load from mentors collection as fallback
      if (items.length === 0) {
        try {
          const mentorsSnap = await getDocs(collection(db, 'mentors'));
          const mentorImages = mentorsSnap.docs
            .map((d, index) => ({
              id: d.id,
              imageUrl: d.data().imageUrl || d.data().mentorImage,
              alt: d.data().name || 'Mentor',
              order: index
            }))
            .filter(m => m.imageUrl)
            .slice(0, 10);
          
          items = mentorImages;
        } catch (mentorError) {
          console.error('Failed to load mentor images:', mentorError);
        }
      }
      
      setImages(items);
    } catch (error) {
      console.error('Failed to load mosaic images:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </section>
    );
  }

  // Tight collage with strong center anchor - all cards orbit the center
  // Strict z-index hierarchy and close spacing (24-40px)
  const imageLayout = [
    { width: 280, height: 200, top: '18%', left: '22%', zIndex: 3, type: 'tech' },           // Top-left tech
    { width: 280, height: 200, top: '22%', right: '22%', zIndex: 3, type: 'css' },          // Top-right CSS
    { width: 360, height: 260, top: '50%', left: '50%', zIndex: 5, isCenter: true, transform: 'translate(-50%, -50%)' }, // CENTER anchor
    { width: 280, height: 200, bottom: '18%', left: '26%', zIndex: 2, type: 'logo' },       // Bottom-left logo
    { width: 320, height: 240, bottom: '20%', right: '24%', zIndex: 3, type: 'students' },  // Bottom-right students
    { width: 240, height: 160, bottom: '12%', right: '34%', zIndex: 1, type: 'dark', isDark: true, opacity: 0.9 }, // Accent card
  ];

  return (
    <section className="relative overflow-hidden mosaic-section" style={{ 
      paddingTop: '88px', 
      paddingBottom: '88px', 
      background: '#FFFFFF'
    }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-[38%_62%] gap-12 items-center">
          {/* Left Column - Heading Block */}
          <div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '64px',
              fontWeight: 700,
              lineHeight: '72px',
              color: '#0F172A',
              marginBottom: '4px'
            }}>
              Masterclasses
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '28px',
              fontWeight: 500,
              lineHeight: '36px',
              color: '#0F172A',
              marginBottom: '10px'
            }}>
              from
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '64px',
              fontWeight: 700,
              lineHeight: '72px',
              color: '#3B82F6',
              marginBottom: '4px'
            }}>
              Mentors
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '64px',
              fontWeight: 700,
              lineHeight: '72px',
              color: '#0F172A'
            }}>
              Community
            </div>
          </div>

          {/* Right Column - Mentor Grid (3 columns × 2 rows) */}
          <div className="mentor-grid-container" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)',
            columnGap: '40px',
            rowGap: '36px'
          }}>
            {images.length > 0 && images.slice(0, 6).map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => navigate(`/mentor/${image.id}`)}
                className="cursor-pointer mentor-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'transparent'
                }}
              >
                {/* Profile Image */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: '220px',
                    height: '220px',
                    borderRadius: '0 52px 0 52px',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.alt || image.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </motion.div>

                {/* Name */}
                <h3 style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  lineHeight: '24px',
                  color: '#0F172A',
                  marginTop: '14px',
                  textAlign: 'center'
                }}>
                  {image.name || 'Mentor Name'},
                </h3>
                
                {/* Role */}
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  color: '#64748B',
                  marginTop: '4px',
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}>
                  {image.title || 'Expert Teacher'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Responsive */}
      <style>{`
        @media (max-width: 1024px) {
          .mosaic-section {
            padding-top: 60px !important;
            padding-bottom: 60px !important;
          }
        }
        
        @media (max-width: 768px) {
          .mosaic-section {
            padding-top: 40px !important;
            padding-bottom: 40px !important;
          }
          
          /* Horizontal scroll for mobile */
          .mentor-grid-container {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            gap: 24px !important;
            padding-bottom: 16px !important;
            scrollbar-width: thin !important;
            scrollbar-color: #3B82F6 #E5E7EB !important;
          }
          
          .mentor-grid-container::-webkit-scrollbar {
            height: 6px;
          }
          
          .mentor-grid-container::-webkit-scrollbar-track {
            background: #E5E7EB;
            border-radius: 10px;
          }
          
          .mentor-grid-container::-webkit-scrollbar-thumb {
            background: #3B82F6;
            border-radius: 10px;
          }
          
          .mentor-grid-container::-webkit-scrollbar-thumb:hover {
            background: #2563EB;
          }
          
          .mentor-card {
            flex: 0 0 auto !important;
            scroll-snap-align: start !important;
            min-width: 200px !important;
          }
          
          .mentor-card > div {
            width: 180px !important;
            height: 180px !important;
          }
        }
        
        @media (max-width: 480px) {
          .mentor-card {
            min-width: 160px !important;
          }
          
          .mentor-card > div {
            width: 160px !important;
            height: 160px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default MasterclassesMosaicSection;
