import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QuestLogin } from '@questlabs/react-sdk';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import questConfig from '../../config/questConfig';
import { useAuth } from '../../contexts/AuthContext';

const { FiBookOpen, FiUsers, FiTarget, FiTrendingUp } = FiIcons;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = ({ userId, token, newUser, ...otherData }) => {
    // Create user data object
    const userData = {
      userId,
      token,
      newUser,
      user_metadata: {
        name: otherData.name || 'User',
        role: otherData.role || 'pupil'
      },
      ...otherData
    };

    // Save to context and localStorage
    login(userData);

    // Navigate based on user type
    if (newUser) {
      navigate('/onboarding');
    } else {
      const role = userData.user_metadata?.role;
      navigate(role === 'teacher' ? '/dashboard' : '/pupil-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10 text-white max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
              <SafeIcon icon={FiBookOpen} className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl font-bold mb-6">
              Welcome to DT Assessment Hub
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Empowering Design & Technology education through intelligent assessment and feedback.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiUsers} className="text-blue-200" />
                <span className="text-blue-100">Collaborative learning environment</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiTarget} className="text-blue-200" />
                <span className="text-blue-100">AI-powered assessment tools</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiTrendingUp} className="text-blue-200" />
                <span className="text-blue-100">Track progress and growth</span>
              </div>
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
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 lg:hidden">
                <SafeIcon icon={FiBookOpen} className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
              <p className="text-gray-600 mt-2">Access your assessment dashboard</p>
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