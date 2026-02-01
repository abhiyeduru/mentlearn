import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { useTheme } from '../../contexts/ThemeContext.js';
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaMoneyBillWave,
  FaTachometerAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserPlus,
  FaChartPie,
  FaCog,
  FaMoon,
  FaSun,
  FaStar,
  FaVideo,
  FaDatabase,
  FaPhoneAlt,
  FaUniversity,
  FaBriefcase
} from 'react-icons/fa';
import Logo from '../common/Logo';

export default function SideNav() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();

  // Handle responsive collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/admin/students', icon: <FaUserGraduate />, label: 'Students' },
    { path: '/admin/creators', icon: <FaUserPlus />, label: 'Creators' },
    { path: '/admin/courses', icon: <FaBook />, label: 'Courses' },
    { path: '/admin/colleges', icon: <FaUniversity />, label: 'Colleges' },
    { path: '/admin/coupons', icon: <FaChartPie />, label: 'Coupons' },
    { path: '/admin/showcase-videos', icon: <FaVideo />, label: 'Showcase Videos' },
    { path: '/admin/landing-videos', icon: <FaVideo />, label: 'Landing Videos' },
    { path: '/admin/masterclass-mosaic', icon: <FaChalkboardTeacher />, label: 'Masterclass Mosaic' },
    { path: '/admin/promo-banners', icon: <FaChartPie />, label: 'Promo Banners' },
    { path: '/admin/testimonials', icon: <FaStar />, label: 'Testimonials' },
    { path: '/admin/learner-experiences', icon: <FaVideo />, label: 'Learner Experiences' },
    { path: '/admin/why-mentneo', icon: <FaChartPie />, label: 'Why Mentneo' },
    { path: '/admin/hiring-partners', icon: <FaBriefcase />, label: 'Hiring Partners' },
    { path: '/admin/partner-accounts', icon: <FaBriefcase />, label: 'Partner Accounts' },
    { path: '/admin/footer', icon: <FaCog />, label: 'Footer Management' },
    { path: '/admin/callback-requests', icon: <FaPhoneAlt />, label: 'Callback Requests' },
    { path: '/admin/data-analysts', icon: <FaDatabase />, label: 'Data Analysts' },
    { path: '/admin/enrollments', icon: <FaUserPlus />, label: 'Enrollments' },
    { path: '/admin/payments', icon: <FaMoneyBillWave />, label: 'Payments' },
    { path: '/admin/reports', icon: <FaChartPie />, label: 'Reports' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' }
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} h-screen transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} fixed left-0 z-30 shadow-lg`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <Link to="/admin/dashboard" className="flex items-center space-x-2">
            <Logo small />
            <span className="font-bold text-xl">Mentneo</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-md ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      <div className="py-4 overflow-y-auto h-[calc(100vh-16rem)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} p-3 rounded-lg transition-colors ${isActive(item.path)
                    ? `${darkMode ? 'bg-indigo-600' : 'bg-indigo-500'} text-white`
                    : `${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
                  }`}
              >
                <span className="text-xl">{item.icon}</span>
                {!collapsed && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={`absolute bottom-0 w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4 space-y-2`}>
        <button
          onClick={toggleDarkMode}
          className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} w-full p-3 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <span className="text-xl">{darkMode ? <FaSun /> : <FaMoon />}</span>
          {!collapsed && <span className="ml-3">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} w-full p-3 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
        >
          <span className="text-xl"><FaSignOutAlt /></span>
          {!collapsed && <span className="ml-3">Sign out</span>}
        </button>
      </div>
    </div>
  );
}
