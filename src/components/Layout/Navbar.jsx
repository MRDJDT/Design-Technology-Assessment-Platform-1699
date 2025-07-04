import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {motion} from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import {useAuth} from '../../contexts/AuthContext';

const {FiHome, FiBookOpen, FiUsers, FiFileText, FiBarChart3, FiSettings, FiLogOut, FiUpload, FiClipboard, FiBook} = FiIcons

export default function Navbar() {
  const {user, logout} = useAuth();
  const location = useLocation();

  const teacherNavItems = [
    {path: '/dashboard', icon: FiHome, label: 'Dashboard'},
    {path: '/schemes', icon: FiBookOpen, label: 'Schemes of Work'},
    {path: '/lessons', icon: FiFileText, label: 'Lesson Plans'},
    {path: '/pupils', icon: FiUsers, label: 'Pupils'},
    {path: '/reports', icon: FiClipboard, label: 'Reports'},
    {path: '/journal-review', icon: FiBook, label: 'Journal Review'},
    {path: '/assessments', icon: FiBarChart3, label: 'Assessments'},
    {path: '/settings', icon: FiSettings, label: 'Settings'}
  ];

  const pupilNavItems = [
    {path: '/pupil-dashboard', icon: FiHome, label: 'Dashboard'},
    {path: '/my-work', icon: FiUpload, label: 'Submit Work'},
    {path: '/learning-journal', icon: FiBook, label: 'Learning Journal'},
    {path: '/feedback', icon: FiBarChart3, label: 'My Feedback'}
  ];

  const navItems = user?.user_metadata?.role === 'teacher' ? teacherNavItems : pupilNavItems;

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiBookOpen} className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold text-gray-900">DT Assessment</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="relative">
                <motion.div
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  whileHover={{scale: 1.05}}
                  whileTap={{scale: 0.95}}
                >
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={item.icon} className="text-lg" />
                    <span>{item.label}</span>
                  </div>
                </motion.div>
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    layoutId="activeTab"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, {user?.user_metadata?.name || 'User'}
            </div>
            <motion.button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
              whileHover={{scale: 1.05}}
              whileTap={{scale: 0.95}}
            >
              <SafeIcon icon={FiLogOut} className="text-lg" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={item.icon} />
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}