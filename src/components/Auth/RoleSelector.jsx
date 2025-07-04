import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiBookOpen, FiSettings, FiArrowRight } = FiIcons;

export default function RoleSelector() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'pupil',
      title: 'Pupil',
      description: 'Access your assignments, submit work, and track progress',
      icon: FiUsers,
      color: 'blue',
      features: ['Submit assignments', 'View feedback', 'Track progress', 'Access resources']
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Manage classes, create lessons, and assess student work',
      icon: FiBookOpen,
      color: 'green',
      features: ['Create lessons', 'Manage pupils', 'Grade work', 'Generate reports']
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Manage the entire system, users, and institutional settings',
      icon: FiSettings,
      color: 'purple',
      features: ['User management', 'System settings', 'Analytics', 'School administration']
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/login/${selectedRole}`);
    }
  };

  const handleDemoLogin = () => {
    navigate('/demo-accounts');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiBookOpen} className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to DT Assessment Hub</h1>
          <p className="text-gray-600 text-lg">Choose your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <motion.div
              key={role.id}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                selectedRole === role.id
                  ? `border-${role.color}-500 bg-${role.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleRoleSelect(role.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-16 h-16 bg-${role.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <SafeIcon icon={role.icon} className={`text-2xl text-${role.color}-600`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">{role.title}</h3>
              <p className="text-gray-600 text-center text-sm mb-4">{role.description}</p>
              <ul className="space-y-2">
                {role.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className={`w-2 h-2 bg-${role.color}-500 rounded-full`}></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {selectedRole === role.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-4 p-2 bg-${role.color}-100 rounded-lg text-center`}
                >
                  <span className={`text-${role.color}-700 font-medium text-sm`}>Selected</span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Continue to Login</span>
            <SafeIcon icon={FiArrowRight} />
          </motion.button>
          
          <motion.button
            onClick={handleDemoLogin}
            className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Try Demo Accounts</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}