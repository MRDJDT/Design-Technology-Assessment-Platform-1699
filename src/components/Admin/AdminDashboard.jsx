import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';
import { DatabaseService } from '../../services/databaseService';

const { FiUsers, FiBookOpen, FiSettings, FiTrendingUp, FiShield, FiDatabase, FiActivity, FiAlertTriangle, FiCalendar, FiBrain, FiClock, FiEdit3, FiEye, FiPlus, FiArrowRight, FiRefreshCw } = FiIcons;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalPupils: 0,
    totalAdmins: 0,
    totalClasses: 0,
    totalAIAnalyses: 0,
    activeUsers: 0,
    systemUptime: 99.8,
    storageUsed: 67.3
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading dashboard data...');

      // Load dashboard stats
      const dashboardStats = await DatabaseService.getDashboardStats();
      console.log('Dashboard stats loaded:', dashboardStats);
      setStats(prev => ({ ...prev, ...dashboardStats }));

      // Load recent activity
      const activityLogs = await DatabaseService.getActivityLogs(10);
      console.log('Activity logs loaded:', activityLogs);
      setRecentActivity(activityLogs);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Only show charts if we have real data
  const hasData = stats.totalUsers > 0;

  const userGrowthData = hasData ? {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    yAxis: { type: 'value' },
    series: [{
      name: 'Total Users',
      data: [
        Math.max(0, stats.totalUsers - 5),
        Math.max(0, stats.totalUsers - 4),
        Math.max(0, stats.totalUsers - 3),
        Math.max(0, stats.totalUsers - 2),
        Math.max(0, stats.totalUsers - 1),
        stats.totalUsers
      ],
      type: 'line',
      smooth: true,
      itemStyle: { color: '#3B82F6' }
    }]
  } : null;

  const roleDistributionData = hasData ? {
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
  } : null;

  const aiUsageData = hasData ? {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: { type: 'value' },
    series: [{
      name: 'AI Analysis',
      data: [
        Math.floor(stats.totalAIAnalyses * 0.1),
        Math.floor(stats.totalAIAnalyses * 0.15),
        Math.floor(stats.totalAIAnalyses * 0.12),
        Math.floor(stats.totalAIAnalyses * 0.18),
        Math.floor(stats.totalAIAnalyses * 0.14),
        Math.floor(stats.totalAIAnalyses * 0.16),
        Math.floor(stats.totalAIAnalyses * 0.15)
      ],
      type: 'bar',
      itemStyle: { color: '#10B981' }
    }]
  } : null;

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Storage approaching 70% capacity',
      time: '2 hours ago',
      action: 'View Storage'
    },
    {
      id: 2,
      type: 'info',
      message: 'System backup completed successfully',
      time: '6 hours ago',
      action: 'View Logs'
    },
    {
      id: 3,
      type: 'success',
      message: `${stats.totalPupils} pupils registered`,
      time: '1 day ago',
      action: 'View Users'
    },
    {
      id: 4,
      type: 'info',
      message: 'AI model updated to latest version',
      time: '2 days ago',
      action: 'AI Settings'
    }
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: FiUsers,
      color: 'blue',
      change: stats.totalUsers > 0 ? '+12%' : '0%',
      path: '/admin/users'
    },
    {
      title: 'Active Teachers',
      value: stats.totalTeachers,
      icon: FiBookOpen,
      color: 'green',
      change: stats.totalTeachers > 0 ? '+3%' : '0%',
      path: '/admin/users'
    },
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      icon: FiCalendar,
      color: 'purple',
      change: stats.totalClasses > 0 ? '+2%' : '0%',
      path: '/admin/classes'
    },
    {
      title: 'AI Analysis',
      value: stats.totalAIAnalyses.toLocaleString(),
      icon: FiBrain,
      color: 'indigo',
      change: stats.totalAIAnalyses > 0 ? '+25%' : '0%',
      path: '/admin/ai-settings'
    },
    {
      title: 'Active Pupils',
      value: stats.totalPupils.toLocaleString(),
      icon: FiUsers,
      color: 'pink',
      change: stats.totalPupils > 0 ? '+15%' : '0%',
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
      title: 'Timetable',
      description: 'Manage school timetables',
      icon: FiClock,
      color: 'orange',
      path: '/admin/timetable'
    },
    {
      title: 'Timetable Settings',
      description: 'Configure time slots and schedules',
      icon: FiSettings,
      color: 'indigo',
      path: '/admin/timetable-settings'
    },
    {
      title: 'Analytics',
      description: 'View system analytics and reports',
      icon: FiTrendingUp,
      color: 'red',
      path: '/admin/analytics'
    },
    {
      title: 'System Health',
      description: 'Monitor system performance',
      icon: FiDatabase,
      color: 'yellow',
      path: '/admin/system'
    },
    {
      title: 'Security',
      description: 'Manage security settings',
      icon: FiShield,
      color: 'gray',
      path: '/admin/security'
    }
  ];

  const handleQuickAction = (path) => {
    navigate(path);
  };

  const handleStatCardClick = (path) => {
    navigate(path);
  };

  const handleAlertAction = (alert) => {
    switch (alert.action) {
      case 'View Storage':
        navigate('/admin/system');
        break;
      case 'View Logs':
        navigate('/admin/system');
        break;
      case 'View Users':
        navigate('/admin/users');
        break;
      case 'AI Settings':
        navigate('/admin/ai-settings');
        break;
      default:
        break;
    }
  };

  const handleActivityClick = (activity) => {
    switch (activity.resource_type) {
      case 'class':
        navigate('/admin/classes');
        break;
      case 'ai':
        navigate('/admin/ai-settings');
        break;
      case 'timetable':
        navigate('/admin/timetable');
        break;
      case 'analysis':
        navigate('/admin/ai-settings');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SafeIcon icon={FiRefreshCw} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SafeIcon icon={FiAlertTriangle} className="text-4xl text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
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
            onClick={() => navigate('/admin/ai-settings')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiBrain} />
            <span>AI Settings</span>
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
            onClick={() => handleQuickAction(action.path)}
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
            onClick={() => handleStatCardClick(stat.path)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} this month
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.color}-100`}>
                <SafeIcon icon={stat.icon} className={`text-xl text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid - Only show if we have data */}
      {hasData && (
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
      )}

      {/* No Data Message */}
      {!hasData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-12 text-center"
        >
          <SafeIcon icon={FiDatabase} className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600 mb-6">Start by creating users, classes, and content to see analytics</p>
          <div className="flex justify-center space-x-4">
            <motion.button
              onClick={() => navigate('/admin/users')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              whileHover={{ scale: 1.02 }}
            >
              Add Users
            </motion.button>
            <motion.button
              onClick={() => navigate('/admin/classes')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              whileHover={{ scale: 1.02 }}
            >
              Create Classes
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
            <motion.button
              onClick={() => navigate('/admin/system')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              whileHover={{ scale: 1.05 }}
            >
              View All
            </motion.button>
          </div>
          <div className="space-y-4">
            {systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => handleAlertAction(alert)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  alert.type === 'warning' ? 'bg-yellow-100' :
                  alert.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <SafeIcon
                    icon={alert.type === 'warning' ? FiAlertTriangle : FiActivity}
                    className={`${
                      alert.type === 'warning' ? 'text-yellow-600' :
                      alert.type === 'success' ? 'text-green-600' : 'text-blue-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
                <SafeIcon icon={FiArrowRight} className="text-gray-400" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <motion.button
              onClick={() => navigate('/admin/logs')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              whileHover={{ scale: 1.05 }}
            >
              View All
            </motion.button>
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.resource_type === 'class' ? 'bg-blue-100' :
                    activity.resource_type === 'ai' ? 'bg-purple-100' :
                    activity.resource_type === 'timetable' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <SafeIcon
                      icon={
                        activity.resource_type === 'class' ? FiCalendar :
                        activity.resource_type === 'ai' ? FiBrain :
                        activity.resource_type === 'timetable' ? FiClock : FiActivity
                      }
                      className={`${
                        activity.resource_type === 'class' ? 'text-blue-600' :
                        activity.resource_type === 'ai' ? 'text-purple-600' :
                        activity.resource_type === 'timetable' ? 'text-green-600' : 'text-orange-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">
                      by {activity.user?.name || 'System'} • {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                  <SafeIcon icon={FiArrowRight} className="text-gray-400" />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <motion.button
            onClick={() => navigate('/admin/system')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            whileHover={{ scale: 1.05 }}
          >
            <span>Detailed View</span>
            <SafeIcon icon={FiArrowRight} />
          </motion.button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">CPU Usage</span>
              <span className="text-sm text-gray-600">23%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '23%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Memory Usage</span>
              <span className="text-sm text-gray-600">45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Storage Usage</span>
              <span className="text-sm text-gray-600">{stats.storageUsed}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${stats.storageUsed}%` }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">AI Performance</span>
              <span className="text-sm text-green-600">Excellent</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}