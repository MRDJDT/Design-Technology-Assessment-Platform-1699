import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { OnBoarding } from '@questlabs/react-sdk';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import questConfig from '../../config/questConfig';
import { useAuth } from '../../contexts/AuthContext';

const { FiBookOpen, FiSettings, FiCheckCircle, FiArrowRight } = FiIcons;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [answers, setAnswers] = useState({});

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const getAnswers = () => {
    // Navigate to main app after onboarding completion
    const role = user?.user_metadata?.role || 'pupil';
    navigate(role === 'teacher' ? '/dashboard' : '/pupil-dashboard');
  };

  if (!userId || !token) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Section - Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-blue-700 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10 text-white max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
              <SafeIcon icon={FiSettings} className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl font-bold mb-6">
              Let's Get Started!
            </h1>
            <p className="text-xl text-green-100 mb-8">
              We're setting up your personalized learning experience. This will only take a moment.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCheckCircle} className="text-green-200" />
                <span className="text-green-100">Customize your dashboard</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCheckCircle} className="text-green-200" />
                <span className="text-green-100">Set learning preferences</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiArrowRight} className="text-green-200" />
                <span className="text-green-100">Start your journey</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
      </div>

      {/* Right Section - Onboarding Component */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8 lg:hidden">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiSettings} className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Setup Your Account</h2>
              <p className="text-gray-600 mt-2">Complete your profile to get started</p>
            </div>

            <div style={{ width: '100%', maxWidth: '400px' }}>
              <OnBoarding
                userId={userId}
                token={token}
                questId={questConfig.QUEST_ONBOARDING_QUESTID}
                answer={answers}
                setAnswer={setAnswers}
                getAnswers={getAnswers}
                accent={questConfig.PRIMARY_COLOR}
                singleChoose="modal1"
                multiChoice="modal2"
              >
                <OnBoarding.Header />
                <OnBoarding.Content />
                <OnBoarding.Footer />
              </OnBoarding>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}