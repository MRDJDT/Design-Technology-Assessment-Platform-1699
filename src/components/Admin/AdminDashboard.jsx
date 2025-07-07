import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';
import { DatabaseService } from '../../services/databaseService';

const {
  FiUsers,
  FiBookOpen,
  FiSettings,
  FiTrendingUp,
  FiShield,
  FiDatabase,
  FiActivity,
  FiAlertTriangle,
  FiCalendar,
  FiBrain,
  FiClock,
  FiArrowRight,
  FiRefreshCw
} = FiIcons;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 12,
    totalTeachers: 3,
    totalPupils: 8,
    totalAdmins: 1,
    totalClasses: 6,
    totalAIAnalyses: 18,
    activeUsers: 9,
    systemUptime: 99.8,
    storageUsed: 67.3
  });
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      action: 'User logged in',
      resource_type: 'user',
      created_at: new Date().toISOString(),
      user: { name: 'Mr. David Jackson' }
    },
    {
      id: 2,
      action: 'Created new class: Year 4A',
      resource_type: 'class',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      user: { name: 'System Administrator' }
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use real database service
      const dashboardStats = await DatabaseService.getDashboardStats();
      console.log('Dashboard stats:', dashboardStats);
      
      if (dashboardStats) {
        setStats(dashboardStats);
      }

      const activityLogs = await DatabaseService.getActivityLogs(10);
      if (activityLogs && activityLogs.length > 0) {
        setRecentActivity(activityLogs);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load some data');
    } finally {
      setLoading(false);
    }
  };

  const userGrowthData = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    yAxis: { type: 'value' },
    series: [{
      name: 'Total Users',
      data: [7, 8, 9, 10, 11, stats.totalUsers],
      type: 'line',
      smooth: true,
      itemStyle: { color: '#3B82F6' }
    }]
  };

  const roleDistributionData = {
    tooltip: { trigger: 'item' },
    series: [{
      name: 'User Roles',
      type: 'pie',
      radius: '50%',
      data: [
        { value: stats.totalPupils, name: 'Pupils' },
        { value: stats.totalTeachers, name: 'Teachers' },
        { value: stats.totalAdmins, name: 'Admins' }
      ]
    }]
  };

  const aiUsageData = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: { type: 'value' },
    series: [{
      name: 'AI Analysis',
      data: [2, 3, 2, 4, 3, 3, 1],
      type: 'bar',
      itemStyle: { color: '#10B981' }
    }]
  };

  const quickActions = [
    {
      title: 'Manage Classes',
      description: 'Create and manage class schedules',
      icon: FiCalendar,
      color: 'blue',
      path: '/admin/classes'
    },
    {
      title: 'AI Settings',
      description: 'Configure AI models and prompts',
      icon: FiBrain,
      color: 'purple',
      path: '/admin/ai-settings'
    },
    {
      title: 'User Management',
      description: 'Manage teachers and pupils',
      icon: FiUsers,
      color: 'green',
      path: '/admin/users'
    },
    {
      title: 'Analytics',
      description: 'View system analytics and reports',
      icon: FiTrendingUp,
      color: 'red',
      path: '/admin/analytics'
    }
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'blue',
      change: '+12%',
      path: '/admin/users'
    },
    {
      title: 'Active Teachers',
      value: stats.totalTeachers,
      icon: FiBookOpen,
      color: 'green',
      change: '+3%',
      path: '/admin/users'
    },
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      icon: FiCalendar,
      color: 'purple',
      change: '+2%',
      path: '/admin/classes'
    },
    {
      title: 'AI Analysis',
      value: stats.totalAIAnalyses,
      icon: FiBrain,
      color: 'indigo',
      change: '+25%',
      path: '/admin/ai-settings'
    },
    {
      title: 'Active Pupils',
      value: stats.totalPupils,
      icon: FiUsers,
      color: 'pink',
      change: '+15%',
      path: '/admin/users'
    },
    {
      title: 'System Uptime',
      value: `${stats.systemUptime}%`,
      icon: FiActivity,
      color: 'green',
      change: '+0.1%',
      path: '/admin/system'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SafeIcon icon={FiRefreshCw} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage users, monitor system health, and configure settings
          </p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={() => navigate('/admin/users')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiUsers} />
            <span>Manage Users</span>
          </motion.button>
          <motion.button
            onClick={loadDashboardData}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Refresh</span>
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiAlertTriangle} className="text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-l-blue-500"
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(action.path)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${action.color}-100`}>
                <SafeIcon icon={action.icon} className={`text-xl text-${action.color}-600`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
              <SafeIcon icon={FiArrowRight} className="text-gray-400" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(stat.path)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm mt-1 text-green-600">{stat.change} this month</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.color}-100`}>
                <SafeIcon icon={stat.icon} className={`text-xl text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <ReactECharts option={userGrowthData} style={{ height: '300px' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <ReactECharts option={roleDistributionData} style={{ height: '300px' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Usage (This Week)</h3>
          <ReactECharts option={aiUsageData} style={{ height: '300px' }} />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                  <SafeIcon icon={FiActivity} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    by {activity.user?.name || 'System'} • {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">CPU Usage</span>
              <span className="text-sm text-gray-600">23%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '23%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Memory Usage</span>
              <span className="text-sm text-gray-600">45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Storage Usage</span>
              <span className="text-sm text-gray-600">{stats.storageUsed}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${stats.storageUsed}%` }}></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}