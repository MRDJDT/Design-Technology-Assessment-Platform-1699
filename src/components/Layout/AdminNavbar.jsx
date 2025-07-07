import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const {
  FiHome,
  FiUsers,
  FiSettings,
  FiDatabase,
  FiBarChart3,
  FiShield,
  FiLogOut,
  FiBookOpen,
  FiBrain,
  FiCalendar,
  FiClock,
  FiBook,
  FiUserPlus
} = FiIcons;

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/admin', icon: FiHome, label: 'Dashboard' },
    { path: '/admin/users', icon: FiUsers, label: 'Users' },
    { path: '/admin/pupils', icon: FiUserPlus, label: 'Pupils' },
    { path: '/admin/classes', icon: FiCalendar, label: 'Classes' },
    { path: '/admin/timetable', icon: FiClock, label: 'Timetable' },
    { path: '/admin/timetable-settings', icon: FiSettings, label: 'Timetable Settings' },
    { path: '/admin/journal-review', icon: FiBook, label: 'Journal Review' },
    { path: '/admin/ai-settings', icon: FiBrain, label: 'AI Settings' },
    { path: '/admin/analytics', icon: FiBarChart3, label: 'Analytics' },
    { path: '/admin/system', icon: FiDatabase, label: 'System' }
  ];

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiShield} className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold text-gray-900">DT Admin</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="relative">
                <motion.div
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={item.icon} className="text-lg" />
                    <span>{item.label}</span>
                  </div>
                </motion.div>
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                    layoutId="activeAdminTab"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiShield} className="text-purple-600" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user?.user_metadata?.name || 'Admin'}</div>
                <div className="text-gray-500">Administrator</div>
              </div>
            </div>

            <motion.button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiLogOut} className="text-lg" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}