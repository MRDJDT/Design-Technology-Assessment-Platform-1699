import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const { FiUsers, FiBookOpen, FiSettings, FiArrowLeft, FiLogIn, FiEye } = FiIcons;

export default function DemoAccounts() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const demoAccounts = [
    {
      role: 'pupil',
      name: 'Sarah Johnson',
      email: 'sarah.pupil@demo.com',
      password: 'demo123',
      description: 'Year 9 student working on electronics project',
      icon: FiUsers,
      color: 'blue',
      stats: {
        'Completed Projects': 12,
        'Average Grade': '3.8/5',
        'Pending Tasks': 3
      }
    },
    {
      role: 'teacher',
      name: 'Mr. David Smith',
      email: 'david.teacher@demo.com',
      password: 'demo123',
      description: 'DT Teacher with 8 years experience',
      icon: FiBookOpen,
      color: 'green',
      stats: {
        'Total Pupils': 85,
        'Active Lessons': 12,
        'Schemes Created': 6
      }
    },
    {
      role: 'admin',
      name: 'Lisa Anderson',
      email: 'lisa.admin@demo.com',
      password: 'demo123',
      description: 'System Administrator and Head of Department',
      icon: FiSettings,
      color: 'purple',
      stats: {
        'Total Users': 250,
        'Active Classes': 15,
        'System Uptime': '99.9%'
      }
    }
  ];

  const handleDemoLogin = (account) => {
    // Simulate demo login
    const userData = {
      userId: `demo-${account.role}-${Date.now()}`,
      token: `demo-token-${Date.now()}`,
      newUser: false,
      user_metadata: {
        name: account.name,
        role: account.role,
        email: account.email,
        isDemo: true
      },
      email: account.email
    };

    login(userData);

    // Navigate based on role
    switch (account.role) {
      case 'teacher':
        navigate('/dashboard');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/pupil-dashboard');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-5xl"
      >
        <div className="flex items-center mb-8">
          <motion.button
            onClick={handleBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-4"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SafeIcon icon={FiArrowLeft} className="text-xl" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Demo Accounts</h1>
            <p className="text-gray-600 mt-1">Try different user roles with pre-configured accounts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {demoAccounts.map((account, index) => (
            <motion.div
              key={account.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
            >
              <div className={`w-16 h-16 bg-${account.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <SafeIcon icon={account.icon} className={`text-2xl text-${account.color}-600`} />
              </div>
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{account.name}</h3>
                <p className={`text-${account.color}-600 font-medium capitalize mb-2`}>{account.role}</p>
                <p className="text-gray-600 text-sm">{account.description}</p>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Account Stats</h4>
                {Object.entries(account.stats).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">{key}:</span>
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-100 rounded-lg p-3 mb-4 text-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <SafeIcon icon={FiEye} className="text-gray-500" />
                  <span className="font-medium text-gray-700">Login Details:</span>
                </div>
                <div className="text-gray-600">
                  <div>Email: {account.email}</div>
                  <div>Password: {account.password}</div>
                </div>
              </div>

              <motion.button
                onClick={() => handleDemoLogin(account)}
                className={`w-full bg-${account.color}-600 text-white py-3 rounded-lg font-medium hover:bg-${account.color}-700 flex items-center justify-center space-x-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SafeIcon icon={FiLogIn} />
                <span>Login as {account.name}</span>
              </motion.button>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">Demo Account Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>✓ Pre-loaded with sample data</div>
              <div>✓ Full feature access</div>
              <div>✓ No registration required</div>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Demo accounts are reset daily and are for evaluation purposes only.
          </p>
        </div>
      </motion.div>
    </div>
  );
}