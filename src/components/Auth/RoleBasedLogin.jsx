import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QuestLogin } from '@questlabs/react-sdk';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import questConfig from '../../config/questConfig';
import { useAuth } from '../../contexts/AuthContext';

const { FiUsers, FiBookOpen, FiSettings, FiArrowLeft, FiTarget, FiTrendingUp, FiAward } = FiIcons;

export default function RoleBasedLogin() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const roleConfig = {
    pupil: {
      title: 'Pupil Login',
      subtitle: 'Access your learning dashboard',
      icon: FiUsers,
      color: 'blue',
      gradient: 'from-blue-600 to-indigo-700',
      features: [
        { icon: FiTarget, text: 'Submit assignments and projects' },
        { icon: FiTrendingUp, text: 'Track your learning progress' },
        { icon: FiAward, text: 'Receive instant AI feedback' }
      ]
    },
    teacher: {
      title: 'Teacher Login',
      subtitle: 'Manage your classes and assessments',
      icon: FiBookOpen,
      color: 'green',
      gradient: 'from-green-600 to-blue-700',
      features: [
        { icon: FiUsers, text: 'Manage your pupils' },
        { icon: FiBookOpen, text: 'Create lesson plans' },
        { icon: FiTarget, text: 'AI-powered assessment tools' }
      ]
    },
    admin: {
      title: 'Administrator Login',
      subtitle: 'System administration and management',
      icon: FiSettings,
      color: 'purple',
      gradient: 'from-purple-600 to-indigo-700',
      features: [
        { icon: FiUsers, text: 'Manage all users' },
        { icon: FiSettings, text: 'System configuration' },
        { icon: FiTrendingUp, text: 'Analytics and reporting' }
      ]
    }
  };

  const config = roleConfig[role] || roleConfig.pupil;

  const handleLogin = ({ userId, token, newUser, ...otherData }) => {
    const userData = {
      userId,
      token,
      newUser,
      user_metadata: {
        name: otherData.name || 'User',
        role: role, // Set role based on login page
        ...otherData
      },
      ...otherData
    };

    login(userData);

    if (newUser) {
      navigate('/onboarding');
    } else {
      // Navigate based on role
      switch (role) {
        case 'teacher':
          navigate('/dashboard');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/pupil-dashboard');
      }
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 flex">
      {/* Left Section - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${config.gradient} p-12 items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10 text-white max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
              <SafeIcon icon={config.icon} className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl font-bold mb-6">{config.title}</h1>
            <p className="text-xl text-blue-100 mb-8">{config.subtitle}</p>
            <div className="space-y-4">
              {config.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <SafeIcon icon={feature.icon} className="text-blue-200" />
                  <span className="text-blue-100">{feature.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
      </div>

      {/* Right Section - Authentication */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <motion.button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-3"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SafeIcon icon={FiArrowLeft} className="text-xl" />
              </motion.button>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
                <p className="text-gray-600 mt-1">{config.subtitle}</p>
              </div>
            </div>

            <div className="text-center mb-6 lg:hidden">
              <div className={`w-16 h-16 bg-${config.color}-600 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <SafeIcon icon={config.icon} className="text-white text-2xl" />
              </div>
            </div>

            <div style={{ width: '100%', maxWidth: '400px' }}>
              <QuestLogin
                onSubmit={handleLogin}
                email={true}
                google={false}
                accent={questConfig.PRIMARY_COLOR}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}