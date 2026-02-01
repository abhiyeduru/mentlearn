import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChevronRight, 
  FaStar,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaUniversity,
  FaVideo
} from 'react-icons/fa';

import MenteoLogo from '../components/MenteoLogo.js';
import ChatUsButton from '../components/ChatUsButton.js';
import WhyStudentsCreatorsSection from '../components/WhyStudentsCreatorsSection.js';
import MasterclassesMosaicSection from '../components/MasterclassesMosaicSection.js';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trendingCourses, setTrendingCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [promoBanner, setPromoBanner] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [selectedMasterclass, setSelectedMasterclass] = useState(null);
  const [learnerExperiences, setLearnerExperiences] = useState([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState(0);
  const [hiringPartners, setHiringPartners] = useState([]);
  const [loadingHiringPartners, setLoadingHiringPartners] = useState(true);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [advisorFormData, setAdvisorFormData] = useState({
    program: '',
    name: '',
    email: '',
    phone: ''
  });
  const [footerSections, setFooterSections] = useState([]);
  const [footerContact, setFooterContact] = useState({
    phone: '',
    email: '',
    copyright: ''
  });
  const [submittingForm, setSubmittingForm] = useState(false);
  
  // Showcase Videos State
  const [showcaseVideos, setShowcaseVideos] = useState([]);
  const [loadingShowcaseVideos, setLoadingShowcaseVideos] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  // Why Mentneo Section State
  const [whyMentneoData, setWhyMentneoData] = useState({
    videoUrl: '',
    mainHeading: '',
    heading: '',
    stats: []
  });
  const [loadingWhyMentneo, setLoadingWhyMentneo] = useState(true);
  const [leadFormData, setLeadFormData] = useState({
    program: '',
    name: '',
    email: '',
    phone: ''
  });
  const [submittingLead, setSubmittingLead] = useState(false);

  // Testimonials State
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Fetch trending courses from Firestore
  useEffect(() => {
    const loadTrendingCourses = async () => {
      try {
        setLoadingCourses(true);
        console.log('🔍 Loading trending courses...');
        const coursesSnap = await getDocs(collection(db, 'courses'));
        console.log(`📊 Found ${coursesSnap.size} total courses`);
        
        let courses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Show all active and published courses (sorted by featured and rating)
        courses = courses
          .filter(c => c.active !== false && c.published !== false)
          .sort((a, b) => (b.featured === true) - (a.featured === true) || (b.rating || 0) - (a.rating || 0));
        
        console.log(`✅ Displaying ${courses.length} trending courses:`, courses.map(c => c.title));
        setTrendingCourses(courses);
      } catch (e) {
        console.error('❌ Failed to load trending courses:', e);
        setTrendingCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadTrendingCourses();
  }, []);

  // Fetch promotional banner from Firestore
  useEffect(() => {
    const loadPromoBanner = async () => {
      try {
        const bannersSnap = await getDocs(collection(db, 'promoBanners'));
        const banners = bannersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        console.log('All promo banners:', banners);
        
        // Get all active banners sorted by priority
        const activeBanners = banners
          .filter(b => b.active === true)
          .sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        console.log('Active promo banners:', activeBanners);
        
        setPromoBanner(activeBanners);
      } catch (e) {
        console.error('Failed to load promo banner:', e);
      }
    };
    loadPromoBanner();
  }, []);

  // Fetch masterclasses from Firestore
  useEffect(() => {
    const loadMasterclasses = async () => {
      try {
        const masterclassesSnap = await getDocs(collection(db, 'masterclasses'));
        const masterclassesData = masterclassesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Get active masterclasses sorted by priority
        const activeMasterclasses = masterclassesData
          .filter(m => m.active !== false)
          .sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        // If no masterclasses, use defaults
        if (activeMasterclasses.length === 0) {
          const defaultMasterclasses = [
            {
              id: 'default-1',
              title: 'Sneak Peek Of Masterclass by Rakesh Misra',
              description: 'Co-Founder Uhana (Acquired by VMWare), Stanford, IIT Madras',
              videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              thumbnailUrl: '',
              featured: true,
              active: true
            }
          ];
          setSelectedMasterclass(defaultMasterclasses[0]);
        } else {
          setSelectedMasterclass(activeMasterclasses[0]);
        }
      } catch (e) {
        console.error('Failed to load masterclasses:', e);
      }
    };
    loadMasterclasses();
  }, []);

  // Fetch learner experiences from Firestore
  useEffect(() => {
    const loadLearnerExperiences = async () => {
      try {
        setLoadingExperiences(true);
        const experiencesSnap = await getDocs(collection(db, 'learnerExperiences'));
        let experiences = experiencesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const activeExperiences = experiences
          .filter(exp => exp.active !== false)
          .sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        if (activeExperiences.length === 0) {
          // Default learner experiences
          const defaultExperiences = [
            {
              id: 'default-1',
              studentName: 'Sharmila Dokala',
              achievement: 'Associate Engineer',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              thumbnailUrl: '',
              active: true
            },
            {
              id: 'default-2',
              studentName: 'Pranavi Lakshmi',
              achievement: 'Full Stack Developer',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              thumbnailUrl: '',
              active: true
            },
            {
              id: 'default-3',
              studentName: 'Ragavendra',
              achievement: 'B.Com Graduate Tech Placement',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              thumbnailUrl: '',
              active: true
            }
          ];
          console.log('No active learner experiences found, using defaults');
          setLearnerExperiences(defaultExperiences);
        } else {
          console.log('Found', activeExperiences.length, 'active learner experiences:', activeExperiences);
          setLearnerExperiences(activeExperiences);
        }
      } catch (e) {
        console.error('Failed to load learner experiences:', e);
        setLearnerExperiences([]);
      } finally {
        setLoadingExperiences(false);
      }
    };
    loadLearnerExperiences();
  }, []);

  // Fetch Why Mentneo section data from Firestore
  useEffect(() => {
    const loadWhyMentneoData = async () => {
      try {
        setLoadingWhyMentneo(true);
        const whyMentneoSnap = await getDocs(collection(db, 'whyMentneo'));
        if (whyMentneoSnap.docs.length > 0) {
          const data = whyMentneoSnap.docs[0].data();
          setWhyMentneoData(data);
        } else {
          // Default data if none in Firestore
          setWhyMentneoData({
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            heading: 'Book a Live Class, For Free!',
            stats: [
              { number: '1200+', label: 'Placement Partners' },
              { number: '15K+', label: 'Careers Transformed' },
              { number: '100+', label: 'Capstone Projects' }
            ]
          });
        }
      } catch (e) {
        console.error('Failed to load Why Mentneo data:', e);
        setWhyMentneoData({
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          heading: 'Book a Live Class, For Free!',
          stats: [
            { number: '1200+', label: 'Placement Partners' },
            { number: '15K+', label: 'Careers Transformed' },
            { number: '100+', label: 'Capstone Projects' }
          ]
        });
      } finally {
        setLoadingWhyMentneo(false);
      }
    };
    loadWhyMentneoData();
  }, []);

  // Fetch hiring partners from Firestore
  useEffect(() => {
    const loadHiringPartners = async () => {
      try {
        setLoadingHiringPartners(true);
        const partnersSnap = await getDocs(collection(db, 'hiringPartners'));
        const partnersData = partnersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const activePartners = partnersData
          .filter(p => p.active !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setHiringPartners(activePartners);
      } catch (e) {
        console.error('Failed to load hiring partners:', e);
        setHiringPartners([]);
      } finally {
        setLoadingHiringPartners(false);
      }
    };
    loadHiringPartners();
  }, []);

  // Fetch testimonials from Firestore
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setLoadingTestimonials(true);
        const testimonialsSnap = await getDocs(collection(db, 'testimonials'));
        const testimonialsData = testimonialsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const activeTestimonials = testimonialsData
          .filter(t => t.active !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        if (activeTestimonials.length === 0) {
          // Default testimonials
          const defaultTestimonials = [
            {
              id: 'default-1',
              name: 'John Doe',
              role: 'Software Engineer',
              company: 'Tech Corp',
              companyLogo: '',
              quote: 'This platform transformed my career! The courses are comprehensive and the instructors are top-notch.',
              rating: 5,
              active: true
            },
            {
              id: 'default-2',
              name: 'Jane Smith',
              role: 'Full Stack Developer',
              company: 'Startup Inc',
              companyLogo: '',
              quote: 'Best learning experience ever! I landed my dream job within 3 months of completing the course.',
              rating: 5,
              active: true
            },
            {
              id: 'default-3',
              name: 'Mike Johnson',
              role: 'Frontend Developer',
              company: 'Design Studio',
              companyLogo: '',
              quote: 'The hands-on projects and mentorship made all the difference. Highly recommended!',
              rating: 5,
              active: true
            }
          ];
          setTestimonials(defaultTestimonials);
        } else {
          setTestimonials(activeTestimonials);
        }
      } catch (e) {
        console.error('Failed to load testimonials:', e);
        setTestimonials([]);
      } finally {
        setLoadingTestimonials(false);
      }
    };
    loadTestimonials();
  }, []);

  // Fetch showcase videos from Firestore
  useEffect(() => {
    const loadShowcaseVideos = async () => {
      try {
        setLoadingShowcaseVideos(true);
        console.log('🎬 Loading showcase videos...');
        const videosSnap = await getDocs(collection(db, 'showcaseVideos'));
        console.log(`📹 Found ${videosSnap.size} showcase videos in database`);
        const videosData = videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const activeVideos = videosData
          .filter(v => v.active !== false)
          .sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        console.log(`✅ Displaying ${activeVideos.length} active showcase videos:`, activeVideos.map(v => v.title));
        setShowcaseVideos(activeVideos);
      } catch (e) {
        console.error('❌ Failed to load showcase videos:', e);
        setShowcaseVideos([]);
      } finally {
        setLoadingShowcaseVideos(false);
      }
    };
    loadShowcaseVideos();
  }, []);

  // Fetch footer data
  useEffect(() => {
    const loadFooterData = async () => {
      try {
        const sectionsSnap = await getDocs(collection(db, 'footerSections'));
        const sections = sectionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        sections.sort((a, b) => (a.order || 0) - (b.order || 0));
        setFooterSections(sections);

        const contactSnap = await getDocs(collection(db, 'footerContact'));
        if (!contactSnap.empty) {
          setFooterContact(contactSnap.docs[0].data());
        }
      } catch (error) {
        console.error('Error loading footer data:', error);
      }
    };
    loadFooterData();
  }, []);

  // Show advisor modal after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAdvisorModal(true);
    }, 5000); // Show after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  // Handle advisor form submission
  const handleAdvisorFormSubmit = async (e) => {
    e.preventDefault();
    setSubmittingForm(true);

    try {
      await addDoc(collection(db, 'advisorRequests'), {
        ...advisorFormData,
        createdAt: new Date().toISOString(),
        status: 'pending',
        source: 'landing_page_popup'
      });

      alert('Thank you! Our advisor will contact you soon.');
      setShowAdvisorModal(false);
      setAdvisorFormData({
        program: '',
        name: '',
        email: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Handle lead form submission (Why Mentneo section) - Save to liveSessionBookings
  const handleLeadFormSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLead(true);

    try {
      await addDoc(collection(db, 'liveSessionBookings'), {
        program: leadFormData.program,
        fullName: leadFormData.name,
        email: leadFormData.email,
        phoneNumber: leadFormData.phone,
        createdAt: new Date().toISOString(),
        timestamp: new Date(),
        status: 'new',
        source: 'landing_page_book_live_class'
      });

      alert('Success! We will contact you soon for your free live class.');
      setLeadFormData({
        program: '',
        name: '',
        email: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error submitting lead form:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmittingLead(false);
    }
  };

  // YouTube helper functions
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const nextExperience = () => {
    setCurrentExperienceIndex((prev) => 
      prev >= learnerExperiences.length - 1 ? 0 : prev + 1
    );
  };

  const prevExperience = () => {
    setCurrentExperienceIndex((prev) => 
      prev <= 0 ? learnerExperiences.length - 1 : prev - 1
    );
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <div className="bg-white text-gray-800 min-h-screen">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2 group">
                  <MenteoLogo />
                  <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Mentneo</span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {/* Programs Dropdown */}
                <div className="relative group">
                  <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 rounded-lg hover:bg-gray-50 transition-all">
                    PROGRAMS
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 mt-1 w-56 bg-blue-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                    <Link to="/programs/academy-track" className="block px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                      ACADEMY TRACK
                    </Link>
                    <Link to="/programs/intensive-track" className="block px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors border-t border-blue-500/30">
                      INTENSIVE TRACK
                    </Link>
                    <Link to="/programs/launchpad" className="block px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors border-t border-blue-500/30">
                      LAUNCHPAD
                    </Link>
                  </div>
                </div>

                <Link to="/courses" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all">
                  COURSES
                </Link>

                <Link to="/reviews" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all">
                  REVIEWS
                </Link>

                {/* Resources Dropdown */}
                <div className="relative group">
                  <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 rounded-lg hover:bg-gray-50 transition-all">
                    RESOURCES
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 mt-1 w-56 bg-blue-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                    <Link to="/resources/blog" className="block px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                      Blog
                  </Link>
                  <Link to="/resources/tutorials" className="block px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors border-t border-blue-500/30">
                    Tutorials
                  </Link>
                  <Link to="/resources/guides" className="block px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors border-t border-blue-500/30">
                    Guides
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Link to="/login" className="px-6 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                LOGIN
              </Link>
              <Link to="/callback" className="px-6 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-md transition-all hover:scale-105 shadow-md">
                APPLY NOW
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">
                  {mobileMenuOpen ? 'Close menu' : 'Open menu'}
                </span>
                {mobileMenuOpen ? (
                  <FaTimes className="block h-6 w-6" />
                ) : (
                  <FaBars className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-40 bg-black md:hidden"
                onClick={toggleMobileMenu}
              />
              
              {/* Slide-in menu */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-[#0c2442] md:hidden overflow-hidden flex flex-col"
              >
                {/* Header with close button */}
                <div className="px-4 py-4 flex items-center justify-between border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <MenteoLogo size="small" />
                    <span className="text-xl font-bold text-white">Mentneo</span>
                  </div>
                  <button
                    className="p-2 text-gray-300 focus:outline-none"
                    onClick={toggleMobileMenu}
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                {/* Menu items - Exactly like NxtWave's style */}
                <div className="flex-1 overflow-y-auto py-0">
                  <nav className="px-0">
                    <Link to="/" className="block px-6 py-4 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/20" onClick={toggleMobileMenu}>
                      <div className="flex items-center justify-between">
                        <span>Home</span>
                        <FaArrowRight className="h-4 w-4 opacity-70" />
                      </div>
                    </Link>
                    {/* Courses menu item */}
                    <Link to="/courses" className="block px-6 py-4 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/20" onClick={toggleMobileMenu}>
                      <div className="flex items-center justify-between">
                        <span>Courses</span>
                        <FaArrowRight className="h-4 w-4 opacity-70" />
                      </div>
                    </Link>
                    {/* Academy menu item */}
                    <Link to="/programs/academy-track" className="block px-6 py-4 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/20" onClick={toggleMobileMenu}>
                      <div className="flex items-center justify-between">
                        <span>ACADEMY TRACK</span>
                        <FaArrowRight className="h-4 w-4 opacity-70" />
                      </div>
                    </Link>
                    {/* Program items with indent - exactly like NxtWave */}
                    <div className="bg-blue-900/20">
                      <Link to="/programs/academy-track" className="block px-6 py-4 pl-10 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="rounded-md w-8 h-8 bg-white mr-3 flex items-center justify-center">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#042952" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                              </svg>
                            </div>
                            <span>ACADEMY TRACK</span>
                          </div>
                          <FaArrowRight className="h-4 w-4 opacity-70" />
                        </div>
                      </Link>
                      
                      <Link to="/programs/intensive-track" className="block px-6 py-4 pl-10 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="rounded-md w-8 h-8 bg-white mr-3 flex items-center justify-center">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M22 19v2H2v-2M22 3v14h-3M2 3v14h3M3 3h18M8 3v10M16 3v13M11 3v7M19 3v10" stroke="#042952" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                              </svg>
                            </div>
                            <span>INTENSIVE TRACK</span>
                          </div>
                          <FaArrowRight className="h-4 w-4 opacity-70" />
                        </div>
                      </Link>

                      <Link to="/programs/launchpad" className="block px-6 py-4 pl-10 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="rounded-md w-8 h-8 bg-white mr-3 flex items-center justify-center">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M8 3l8 5v8l-8 5V3z" stroke="#042952" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                              </svg>
                            </div>
                            <span>LAUNCHPAD</span>
                          </div>
                          <FaArrowRight className="h-4 w-4 opacity-70" />
                        </div>
                      </Link>
                    </div>
                    
                    <Link to="/reviews" className="block px-6 py-4 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/20">
                      <div className="flex items-center justify-between">
                        <span>Reviews</span>
                        <FaArrowRight className="h-4 w-4 opacity-70" />
                      </div>
                    </Link>
                  </nav>
                </div>

                {/* Bottom action buttons */}
                <div className="p-6 border-t border-gray-700">
                  <Link
                    to="/login"
                    className="block w-full py-3 px-4 rounded-md shadow text-center mb-3 bg-transparent border border-white text-white hover:bg-white/10"
                  >
                    Login →
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-blue-600 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Floating Stats Cards */}
        <motion.div
          initial={{ opacity: 0, x: -50, rotate: -5 }}
          animate={{ opacity: 1, x: 0, rotate: -8 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute top-32 left-8 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl z-10 hidden lg:block"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">10,000+</div>
            <div className="text-sm text-gray-600 font-medium">Learners Enrolled</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 8 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute top-48 right-8 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl z-10 hidden lg:block"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">90%+</div>
            <div className="text-sm text-gray-600 font-medium">Placement Rate</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, rotate: -5 }}
          animate={{ opacity: 1, y: 0, rotate: -6 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="absolute bottom-32 left-16 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl z-10 hidden lg:block"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">₹8+ LPA</div>
            <div className="text-sm text-gray-600 font-medium">Avg Package</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, rotate: 5 }}
          animate={{ opacity: 1, y: 0, rotate: 7 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="absolute bottom-40 right-20 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl z-10 hidden lg:block"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">50+</div>
            <div className="text-sm text-gray-600 font-medium">Expert Mentors</div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Stop Watching Tutorials.<br />
              <span className="text-cyan-400">
                Start Becoming a Developer.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join India's most immersive coding bootcamp. Learn by building real projects with expert mentors.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/courses"
                className="group relative bg-white text-blue-700 px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              >
                <span className="relative z-10">Explore Programs</span>
              </Link>
              
              <Link
                to="/callback"
                className="group bg-cyan-500 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-cyan-400/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-2 border-white/30"
              >
                Talk to a Mentor →
              </Link>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16 flex flex-wrap justify-center gap-8 text-white/90"
            >
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">100% Live Classes</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Real-world Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Placement Support</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Why Students & Creators Join Us - Premium Section */}
      <WhyStudentsCreatorsSection />

      {/* Masterclasses Mosaic Section */}
      <MasterclassesMosaicSection />

      {/* New & Trending Courses */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-3">
            Popular
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">New & Trending Courses</h2>
          <p className="mt-3 text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our latest and most popular programs carefully designed to keep you ahead in the tech industry.
          </p>
        </motion.div>

        {loadingCourses ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-t-4 border-b-4 border-[#007bff] rounded-full"></div>
          </div>
        ) : trendingCourses.length > 0 ? (
          <div className="relative max-w-7xl mx-auto">
            {/* Scroll Container */}
            <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex gap-6 px-2" style={{ minWidth: 'min-content' }}>
                {trendingCourses.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="flex-shrink-0 w-[340px] snap-start"
                  >
                    <Link to={`/courses/${course.id}`} className="block h-full">
                      <div className="relative h-full bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                        {/* Course Image */}
                        <div className="relative h-48 bg-blue-400 overflow-hidden">
                          {course.thumbnailUrl ? (
                            <img 
                              src={course.thumbnailUrl} 
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = `https://via.placeholder.com/400x250/667eea/ffffff?text=${encodeURIComponent(course.title || 'Course')}`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold bg-blue-500">
                              {course.title?.charAt(0) || '📚'}
                            </div>
                          )}
                          
                          {/* Badges */}
                          <div className="absolute top-4 right-4 flex gap-2">
                            {course.featured && (
                              <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold uppercase">
                                Featured
                              </span>
                            )}
                            {course.isNew && (
                              <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold uppercase">
                                New
                              </span>
                            )}
                          </div>

                          {/* Price Badge - Hidden */}
                          {/* <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full">
                            <span className="font-bold text-lg text-gray-900">
                              ₹{course.price ? course.price.toLocaleString('en-IN') : '0'}
                            </span>
                          </div> */}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                          {/* Category/Level */}
                          {(course.category || course.level) && (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                {course.level || 'Intermediate'}
                              </span>
                              {course.category && (
                                <span className="text-xs text-gray-500">
                                  {course.category}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Title */}
                          <h3 className="text-xl font-bold text-gray-900 hover:text-[#007bff] transition-colors mb-2 line-clamp-2">
                            {course.title}
                          </h3>

                          {/* Description */}
                          <p className="text-gray-600 text-sm flex-1 line-clamp-2 mb-3">
                            {course.description || 'Professional course with hands-on projects and mentorship'}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center justify-between py-3 border-t border-gray-100 mb-3">
                            <div className="flex items-center gap-1">
                              <FaStar className="text-yellow-400 text-sm" />
                              <span className="font-semibold text-gray-900">
                                {course.rating ? course.rating.toFixed(1) : '4.8'}
                              </span>
                              <span className="text-gray-500 text-xs">
                                ({course.reviews || course.studentsEnrolled || 0}+ reviews)
                              </span>
                            </div>
                          </div>

                          {/* Instructor/Duration */}
                          <div className="space-y-2 mb-4">
                            {course.creatorName && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="w-2 h-2 rounded-full bg-[#007bff]"></span>
                                By {course.creatorName}
                              </div>
                            )}
                            {course.duration && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="w-2 h-2 rounded-full bg-[#007bff]"></span>
                                {course.duration}
                              </div>
                            )}
                            {course.lessons && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="w-2 h-2 rounded-full bg-[#007bff]"></span>
                                {course.lessons} lessons
                              </div>
                            )}
                          </div>

                          {/* CTA Button */}
                          <button className="w-full py-2.5 bg-[#007bff] text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:scale-105">
                            View Course <FaChevronRight className="inline ml-2" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {trendingCourses.length > 3 && (
              <>
                <button
                  onClick={() => {
                    const container = document.querySelector('.overflow-x-auto');
                    container.scrollBy({ left: -360, behavior: 'smooth' });
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-50 shadow-xl rounded-full p-3 z-10 transition-all hover:scale-110 border border-gray-200"
                  aria-label="Scroll left"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const container = document.querySelector('.overflow-x-auto');
                    container.scrollBy({ left: 360, behavior: 'smooth' });
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-50 shadow-xl rounded-full p-3 z-10 transition-all hover:scale-110 border border-gray-200"
                  aria-label="Scroll right"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No courses available at the moment. Check back soon!</p>
            <Link to="/courses" className="inline-flex items-center text-[#007bff] hover:underline font-medium mt-4">
              Explore All Courses <FaChevronRight className="ml-2" />
            </Link>
          </div>
        )}

        {/* View All Button */}
        {trendingCourses.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link 
              to="/courses" 
              className="inline-flex items-center px-8 py-3 bg-[#007bff] text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              Explore All Courses <FaArrowRight className="ml-3" />
            </Link>
          </motion.div>
        )}
      </section>

      {/* Why Mentneo Section - Scaler Style */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {loadingWhyMentneo ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Main Heading */}
              {whyMentneoData.mainHeading && (
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-gray-900 mb-12"
                >
                  {whyMentneoData.mainHeading}
                </motion.h1>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column - Video + Stats */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {/* Video Container */}
                <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-xl mb-6">
                  {whyMentneoData.videoUrl ? (
                    <video
                      src={whyMentneoData.videoUrl}
                      controls
                      className="w-full h-full object-cover"
                      poster={whyMentneoData.videoPoster || ''}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Stats Section */}
                <div className="space-y-6">
                  {whyMentneoData.stats && whyMentneoData.stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="text-4xl font-bold text-gray-900">{stat.number}</div>
                      <div className="text-base font-medium text-gray-600">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right Column - Lead Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-white border border-gray-200 rounded-lg shadow-md p-8">
                  {/* Form Heading */}
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    {whyMentneoData.heading || 'Book a Live Class, For Free!'}
                    {whyMentneoData.heading || 'Book a Live Class, For Free!'}
                  </h2>

                  {/* Lead Form */}
                  <form onSubmit={handleLeadFormSubmit} className="space-y-4">
                    {/* Program Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Topic of Interest<span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={leadFormData.program}
                        onChange={(e) => setLeadFormData({...leadFormData, program: e.target.value})}
                        className="w-full h-11 px-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Select Program</option>
                        <option value="Full Stack Development">Full Stack Development</option>
                        <option value="Frontend Development">Frontend Development</option>
                        <option value="Backend Development">Backend Development</option>
                        <option value="Data Science">Data Science</option>
                        <option value="AI/ML">AI/ML</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Mobile Development">Mobile Development</option>
                      </select>
                    </div>

                    {/* Name Input */}
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Enter Name"
                        value={leadFormData.name}
                        onChange={(e) => setLeadFormData({...leadFormData, name: e.target.value})}
                        className="w-full h-11 px-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Enter Email"
                        value={leadFormData.email}
                        onChange={(e) => setLeadFormData({...leadFormData, email: e.target.value})}
                        className="w-full h-11 px-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>

                    {/* Phone Input */}
                    <div>
                      <div className="flex gap-2">
                        <select className="w-20 h-11 px-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                        </select>
                        <input
                          type="tel"
                          required
                          placeholder="Enter Phone"
                          value={leadFormData.phone}
                          onChange={(e) => setLeadFormData({...leadFormData, phone: e.target.value})}
                          className="flex-1 h-11 px-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submittingLead}
                      className="w-full h-12 bg-[#A21D4C] hover:bg-[#8a1840] text-white font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingLead ? 'SUBMITTING...' : 'BOOK FREE LIVE CLASS'}
                    </button>

                    {/* Limited Seats Message */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Limited Seats Left
                    </div>

                    {/* Legal Text */}
                    <p className="text-xs text-gray-500 text-center">
                      By creating an account I have read and agree to{' '}
                      <Link to="/terms" className="text-blue-600 hover:underline">Terms</Link> and{' '}
                      <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                    </p>
                  </form>

                  {/* Already have account */}
                  <p className="text-sm text-gray-600 text-center mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                      Click here
                    </Link>
                  </p>
                </div>
              </motion.div>
            </div>
            </>
          )}
        </div>
      </section>

      {/* Hiring Partners Section - Enhanced Visual Collage */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 w-full bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Heading with Enhanced Design */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold uppercase tracking-wide mb-4">
              <FaUniversity className="mr-2" />
              Trusted By Industry Leaders
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Hiring Partners</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of students who landed their dream jobs at top companies and startups worldwide
            </p>
          </motion.div>

          {loadingHiringPartners ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading our amazing partners...</p>
            </div>
          ) : hiringPartners.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-3xl shadow-lg border-2 border-gray-100"
            >
              <FaUniversity className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">Building partnerships with leading companies</p>
              <p className="text-gray-400 mt-2">Check back soon for updates!</p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {/* Enhanced Marquee Rows with Cards */}
              <div className="space-y-8">
                {/* Row 1 - Scroll Right to Left with Card Style */}
                <div className="marquee-container">
                  <div className="marquee-content marquee-left">
                    {[...hiringPartners, ...hiringPartners, ...hiringPartners].map((partner, index) => (
                      <motion.div 
                        key={`row1-${index}`} 
                        className="marquee-item"
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl p-6 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 min-w-[180px] h-[120px] flex items-center justify-center group">
                          <img
                            src={partner.logoUrl}
                            alt={partner.name}
                            className="h-16 max-w-[140px] object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                            title={partner.name}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Row 2 - Scroll Left to Right with Card Style */}
                <div className="marquee-container">
                  <div className="marquee-content marquee-right">
                    {[...hiringPartners, ...hiringPartners, ...hiringPartners].map((partner, index) => (
                      <motion.div 
                        key={`row2-${index}`} 
                        className="marquee-item"
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl p-6 border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 min-w-[180px] h-[120px] flex items-center justify-center group">
                          <img
                            src={partner.logoUrl}
                            alt={partner.name}
                            className="h-16 max-w-[140px] object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                            title={partner.name}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Row 3 - Scroll Right to Left (New) */}
                <div className="marquee-container">
                  <div className="marquee-content marquee-left-slow">
                    {[...hiringPartners, ...hiringPartners, ...hiringPartners].map((partner, index) => (
                      <motion.div 
                        key={`row3-${index}`} 
                        className="marquee-item"
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl p-6 border-2 border-gray-100 hover:border-green-200 transition-all duration-300 min-w-[180px] h-[120px] flex items-center justify-center group">
                          <img
                            src={partner.logoUrl}
                            alt={partner.name}
                            className="h-16 max-w-[140px] object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                            title={partner.name}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-16"
              >
                <p className="text-xl text-gray-700 mb-6 font-medium">
                  Ready to join these successful students?
                </p>
                <Link
                  to="/callback"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Book Free Demo <FaArrowRight className="ml-3" />
                </Link>
              </motion.div>
            </div>
          )}
        </div>

        <style jsx>{`
          .marquee-container {
            overflow: hidden;
            position: relative;
            width: 100%;
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          }

          .marquee-content {
            display: flex;
            gap: 24px;
            align-items: center;
          }

          .marquee-left {
            animation: scrollLeft 40s linear infinite;
          }

          .marquee-right {
            animation: scrollRight 40s linear infinite;
          }

          .marquee-left-slow {
            animation: scrollLeft 50s linear infinite;
          }

          .marquee-content:hover {
            animation-play-state: paused;
          }

          .marquee-item {
            flex-shrink: 0;
          }

          @keyframes scrollLeft {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-33.333%);
            }
          }

          @keyframes scrollRight {
            0% {
              transform: translateX(-33.333%);
            }
            100% {
              transform: translateX(0);
            }
          }

          @media (max-width: 768px) {
            .marquee-container {
              mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
              -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
            }
            
            .marquee-item > div {
              min-width: 140px;
              height: 100px;
              padding: 1rem;
            }
            
            .marquee-item img {
              height: 48px;
              max-width: 100px;
            }
            
            .marquee-left,
            .marquee-right,
            .marquee-left-slow {
              animation-duration: 35s;
            }
          }

          .animation-delay-2000 {
            animation-delay: 2s;
          }

          .animation-delay-4000 {
            animation-delay: 4s;
          }

          @keyframes blob {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(20px, -20px) scale(1.1);
            }
            50% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            75% {
              transform: translate(20px, 20px) scale(1.05);
            }
          }

          .animate-blob {
            animation: blob 20s infinite;
          }
        `}</style>
      </section>

      {/* Student Testimonials - Modern Design */}
      {testimonials.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 w-full bg-white">
          <div className="max-w-6xl mx-auto">
            {loadingTestimonials ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading testimonials...</p>
              </div>
            ) : (
              <>
                {/* Main Testimonial Display */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="mb-16"
                  >
                    {/* Large Quote Icon */}
                    <div className="flex justify-center mb-8">
                      <div className="text-[180px] leading-none text-gray-200 font-serif select-none">"</div>
                    </div>

                    {/* Quote Text */}
                    <p className="text-2xl md:text-3xl text-gray-700 text-center font-normal mb-12 leading-relaxed max-w-4xl mx-auto px-4">
                      {testimonials[currentTestimonial]?.quote}
                    </p>

                    {/* Student Info and Company */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
                      {/* Student Details */}
                      <div className="text-center md:text-right">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {testimonials[currentTestimonial]?.name}
                        </h3>
                        <p className="text-base text-gray-600">
                          {testimonials[currentTestimonial]?.role}
                        </p>
                      </div>

                      {/* Divider */}
                      {testimonials[currentTestimonial]?.companyLogo && (
                        <div className="hidden md:block w-px h-12 bg-gray-300"></div>
                      )}

                      {/* Company Logo */}
                      {testimonials[currentTestimonial]?.companyLogo && (
                        <div className="flex items-center">
                          <img
                            src={testimonials[currentTestimonial]?.companyLogo}
                            alt={testimonials[currentTestimonial]?.company || 'Company'}
                            className="h-12 max-w-[200px] object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Avatar Carousel with Navigation */}
                <div className="flex items-center justify-center gap-6 mb-8">
                  {/* Left Arrow */}
                  <button
                    onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center group"
                    aria-label="Previous testimonial"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Avatar Thumbnails */}
                  <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide max-w-3xl px-4">
                    {testimonials.map((testimonial, index) => (
                      <button
                        key={testimonial.id}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`flex-shrink-0 transition-all duration-300 ${
                          currentTestimonial === index
                            ? 'ring-4 ring-yellow-400 scale-110'
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img
                          src={testimonial.imageUrl || `https://ui-avatars.com/api/?name=${testimonial.name.replace(' ', '+')}&background=random&size=128`}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Right Arrow */}
                  <button
                    onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center group"
                    aria-label="Next testimonial"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Request a Callback Button */}
                <div className="flex justify-center mt-12">
                  <Link
                    to="/BookDemo"
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21  0 3 14.284 3 6V5z" />
                    </svg>
                    Request a Callback
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Promotional Banner Section - Horizontal Carousel */}
      {promoBanner.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 w-full bg-blue-50">
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              {/* Navigation Arrows */}
              {promoBanner.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentBannerIndex((prev) => (prev === 0 ? promoBanner.length - 1 : prev - 1))}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
                    aria-label="Previous banner"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentBannerIndex((prev) => (prev === promoBanner.length - 1 ? 0 : prev + 1))}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
                    aria-label="Next banner"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Banner Carousel */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
                >
                  {promoBanner.map((banner, index) => (
                    <div key={banner.id} className="w-full flex-shrink-0 px-2">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                            {/* Image Section */}
                            {banner.imageUrl && (
                              <div className="relative h-56 lg:h-auto overflow-hidden">
                                <img 
                                  src={banner.imageUrl} 
                                  alt={banner.title || 'Promotional Banner'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            {/* Content Section */}
                            <div className="p-6 lg:p-8 flex flex-col justify-between">
                              {banner.title && (
                                <h2 className="text-2xl lg:text-3xl font-bold mb-3 text-gray-900">{banner.title}</h2>
                              )}
                              
                              {banner.description && (
                                <p className="text-gray-600 mb-4 text-sm lg:text-base">
                                  {banner.description}
                                </p>
                              )}
                              
                              {(banner.originalPrice || banner.offerPrice) && (
                                <div className="flex items-center gap-4 mb-4">
                                  {banner.originalPrice && (
                                    <span className="text-gray-400 line-through text-lg">₹{banner.originalPrice}</span>
                                  )}
                                  {banner.offerPrice && (
                                    <span className="text-3xl lg:text-4xl font-bold text-gray-900">₹{banner.offerPrice}</span>
                                  )}
                                  {banner.discount && (
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                      {banner.discount}% OFF
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {banner.features && banner.features.length > 0 && (
                                <ul className="space-y-2 mb-5">
                                  {banner.features.slice(0, 3).map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              
                              <div className="flex flex-col sm:flex-row gap-3">
                                {banner.ctaText && banner.ctaLink && (
                                  <Link 
                                    to={banner.ctaLink} 
                                    className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                  >
                                    {banner.ctaText} <FaChevronRight className="ml-2 text-sm" />
                                  </Link>
                                )}
                              </div>
                              
                              {banner.footerText && (
                                <p className="mt-4 text-xs text-gray-500">
                                  {banner.footerText}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots Indicator */}
              {promoBanner.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {promoBanner.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBannerIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentBannerIndex === index
                          ? 'w-8 bg-blue-600'
                          : 'w-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to banner ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Showcase Videos Section - Contained Video */}
      <section className="w-full bg-black py-12 px-4 sm:px-6 lg:px-8">
        {!loadingShowcaseVideos && showcaseVideos.length > 0 && (
          <div className="relative max-w-5xl mx-auto">
            {/* Contained Video Player with CTA Button */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative w-full"
            >
              {/* Video Container - Contained Width */}
              <div className="relative w-full rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
                {showcaseVideos[currentVideoIndex]?.videoUrl ? (
                  showcaseVideos[currentVideoIndex]?.videoType === 'direct' ? (
                    // Direct uploaded video (MP4, WebM, etc)
                    <video
                      src={showcaseVideos[currentVideoIndex].videoUrl}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    // YouTube/Vimeo embed
                    <iframe
                      src={showcaseVideos[currentVideoIndex].videoUrl}
                      title={showcaseVideos[currentVideoIndex].title || 'Masterclass Video'}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  )
                ) : showcaseVideos[currentVideoIndex]?.thumbnailUrl ? (
                  <img 
                    src={showcaseVideos[currentVideoIndex].thumbnailUrl} 
                    alt={showcaseVideos[currentVideoIndex].title || 'Video Thumbnail'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <FaStar className="text-6xl text-gray-600" />
                  </div>
                )}
                
                {/* Centered CTA Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Link
                    to="/BookDemo"
                    className="pointer-events-auto px-10 py-4 bg-gradient-to-r from-pink-600 to-pink-700 text-white text-lg font-bold rounded-lg shadow-2xl hover:from-pink-700 hover:to-pink-800 transition-all hover:scale-105 flex items-center gap-3"
                  >
                    JOIN A FREE LIVE CLASS
                    <FaArrowRight />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Footer Sections */}
          {footerSections.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
              {footerSections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links?.map((link, idx) => (
                      <li key={idx}>
                        <Link 
                          to={link.url} 
                          className="text-sm text-gray-600 hover:text-[#007bff] transition-colors"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600 text-center md:text-left">
                {footerContact.copyright || `© ${new Date().getFullYear()} Mentneo Technologies Pvt. Ltd. All rights reserved.`}
              </p>
              
              {(footerContact.phone || footerContact.email) && (
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  {footerContact.phone && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Need Help?</span>
                      <span>Talk to us at</span>
                      <a href={`tel:${footerContact.phone}`} className="text-[#007bff] font-bold hover:underline">
                        {footerContact.phone}
                      </a>
                    </div>
                  )}
                  {footerContact.email && (
                    <span className="hidden md:inline">or</span>
                  )}
                  {footerContact.email && (
                    <a href={`mailto:${footerContact.email}`} className="text-[#007bff] font-bold hover:underline uppercase">
                      Request Callback →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button on Landing */}
      <ChatUsButton label="Chat with us" variant="whatsapp" />

      {/* Advisor Modal Popup */}
      {showAdvisorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden animate-slideUp">
            {/* Close Button */}
            <button
              onClick={() => setShowAdvisorModal(false)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Left Side - Blue Section */}
              <div className="bg-blue-700 text-white p-8 md:w-1/2 flex flex-col justify-between relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400 rounded-full translate-y-1/2 -translate-x-1/2 opacity-20"></div>
                
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Talk to our Advisor
                  </h2>
                  
                  <div className="space-y-4 mb-8">
                    <p className="text-lg font-semibold text-yellow-300">AND GET</p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-400 text-xl">✨</span>
                        <span className="text-base md:text-lg">Personalized Career Roadmap</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-400 text-xl">✨</span>
                        <span className="text-base md:text-lg">Free Career Counselling</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-400 text-xl">✨</span>
                        <span className="text-base md:text-lg">Free Access to Mentneo Events</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advisor Image */}
                <div className="relative z-10 flex justify-center md:justify-start">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-30"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop" 
                      alt="Career Advisor"
                      className="relative w-48 h-48 md:w-56 md:h-56 object-cover rounded-lg shadow-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Form Section */}
              <div className="p-8 md:w-1/2 bg-white">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Talk to our Advisor!
                </h3>

                <form onSubmit={handleAdvisorFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Topic of Interest*
                    </label>
                    <select
                      required
                      value={advisorFormData.program}
                      onChange={(e) => setAdvisorFormData({ ...advisorFormData, program: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    >
                      <option value="">Select Program</option>
                      <option value="Full Stack Development">Full Stack Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Cloud Computing">Cloud Computing</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Name*
                    </label>
                    <input
                      type="text"
                      required
                      value={advisorFormData.name}
                      onChange={(e) => setAdvisorFormData({ ...advisorFormData, name: e.target.value })}
                      placeholder="Enter Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Email*
                    </label>
                    <input
                      type="email"
                      required
                      value={advisorFormData.email}
                      onChange={(e) => setAdvisorFormData({ ...advisorFormData, email: e.target.value })}
                      placeholder="Enter Email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Phone*
                    </label>
                    <div className="flex gap-2">
                      <select className="px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 w-24">
                        <option value="+91">+91</option>
                      </select>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={advisorFormData.phone}
                        onChange={(e) => setAdvisorFormData({ ...advisorFormData, phone: e.target.value })}
                        placeholder="Enter Phone"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingForm}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingForm ? 'SUBMITTING...' : 'CONTINUE'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default LandingPage;
