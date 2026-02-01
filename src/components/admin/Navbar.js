import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaBook, 
  FaMoneyBillWave, 
  FaTachometerAlt, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaUser,
  FaUserPlus,
  FaUniversity
} from 'react-icons/fa';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  return (
    <nav className={`bg-gray-800 sticky top-0 z-50 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/admin/dashboard" className="text-white font-bold text-xl">
                MentLearn Admin
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-baseline space-x-1 overflow-x-auto max-w-3xl">
                <Link
                  to="/admin/dashboard"
                  className="text-white hover:bg-gray-700 px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap"
                  title="Dashboard"
                >
                  <FaTachometerAlt className="inline-block mr-1" /> Dashboard
                </Link>
                <Link
                  to="/admin/students"
                  className="text-white hover:bg-gray-700 px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap"
                  title="Students"
                >
                  <FaUserGraduate className="inline-block mr-1" /> Students
                </Link>
                <Link
                  to="/admin/mentors"
                  className="text-white hover:bg-gray-700 px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap"
                  title="Mentors"
                >
                  <FaChalkboardTeacher className="inline-block mr-1" /> Mentors
                </Link>
                <Link
                  to="/admin/courses"
                  className="text-white hover:bg-gray-700 px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap"
                  title="Courses"
                >
                  <FaBook className="inline-block mr-1" /> Courses
                </Link>
                <Link
                  to="/admin/colleges"
                  className="text-white hover:bg-gray-700 px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap bg-blue-600"
                  title="Colleges"
                >
                  <FaUniversity className="inline-block mr-1" /> Colleges
                </Link>
                <Link
                  to="/admin/enrollments"
                  className="text-white hover:bg-gray-700 px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap"
                  title="Enrollments"
                >
                  <FaUserPlus className="inline-block mr-1" /> Enrollments
                </Link>
                <Link
                  to="/admin/payments"
                  className="text-white hover:bg-gray-700 px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap"
                  title="Payments"
                >
                  <FaMoneyBillWave className="inline-block mr-1" /> Payments
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    id="user-menu-button"
                  >
                    <span className="sr-only">Open user menu</span>
                    <FaUser className="h-8 w-8 rounded-full p-1 bg-gray-700 text-white" />
                  </button>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                <FaSignOutAlt className="inline-block mr-1" /> Sign out
              </button>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <FaTimes className="block h-6 w-6" /> : <FaBars className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/admin/dashboard"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaTachometerAlt className="inline-block mr-1" /> Dashboard
            </Link>
            <Link
              to="/admin/students"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaUserGraduate className="inline-block mr-1" /> Students
            </Link>
            <Link
              to="/admin/mentors"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaChalkboardTeacher className="inline-block mr-1" /> Mentors
            </Link>
            <Link
              to="/admin/courses"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaBook className="inline-block mr-1" /> Courses
            </Link>
            <Link
              to="/admin/colleges"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaUniversity className="inline-block mr-1" /> Colleges
            </Link>
            <Link
              to="/admin/partner-requests"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaUniversity className="inline-block mr-1" /> Partner Requests
            </Link>
            <Link
              to="/admin/enrollments"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaUserPlus className="inline-block mr-1" /> Enrollments
            </Link>
            <Link
              to="/admin/payments"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaMoneyBillWave className="inline-block mr-1" /> Payments
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="text-white hover:bg-gray-700 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
            >
              <FaSignOutAlt className="inline-block mr-1" /> Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
